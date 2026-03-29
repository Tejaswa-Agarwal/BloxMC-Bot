const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addReactionRole, removeReactionRole, deleteReactionRoleMessage, getMessageReactionRoles, setReactionRoleConfig, getReactionRoleConfig } = require('../../utils/reactionRoleManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Manage reaction roles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a reaction role message')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title of the embed')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description of the embed')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('mode')
                        .setDescription('Role selection mode')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Normal (multiple roles)', value: 'normal' },
                            { name: 'Unique (only one role at a time)', value: 'unique' }
                        ))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Use reactions or buttons')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Buttons (recommended)', value: 'buttons' },
                            { name: 'Reactions', value: 'reactions' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to a reaction role message')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('ID of the reaction role message')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to assign')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji or button label')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('style')
                        .setDescription('Button style (buttons only)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Blue', value: 'Primary' },
                            { name: 'Gray', value: 'Secondary' },
                            { name: 'Green', value: 'Success' },
                            { name: 'Red', value: 'Danger' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from a reaction role message')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('ID of the reaction role message')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji or button to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a reaction role message')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('ID of the message to delete')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in a server.', ephemeral: true });
            return;
        }

        const { hasAdminPermission } = require('../../utils/permissions');
        if (!hasAdminPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
            await interaction.editReply({ content: '❌ Only admins can manage reaction roles.', ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const mode = interaction.options.getString('mode') || 'normal';
            const type = interaction.options.getString('type') || 'buttons';

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(title)
                .setDescription(description)
                .setFooter({ text: mode === 'unique' ? 'You can only have one role from this message' : 'Select your roles' });

            try {
                const message = await interaction.channel.send({ embeds: [embed] });
                
                // Initialize in config
                const config = getReactionRoleConfig(interaction.guild.id);
                config[message.id] = {
                    roles: {},
                    mode: mode,
                    type: type
                };
                setReactionRoleConfig(interaction.guild.id, config);

                await interaction.editReply({ 
                    content: `✅ Reaction role message created!\n\n` +
                            `**Message ID:** \`${message.id}\`\n` +
                            `**Type:** ${type}\n` +
                            `**Mode:** ${mode}\n\n` +
                            `Use \`/reactionrole add message-id:${message.id}\` to add roles.`
                });
            } catch (error) {
                console.error('Error creating reaction role message:', error);
                await interaction.editReply({ content: '❌ Failed to create message.', ephemeral: true });
            }
        } else if (subcommand === 'add') {
            const messageId = interaction.options.getString('message-id');
            const role = interaction.options.getRole('role');
            const emoji = interaction.options.getString('emoji');
            const style = interaction.options.getString('style') || 'Primary';

            try {
                const message = await interaction.channel.messages.fetch(messageId);
                const messageConfig = getMessageReactionRoles(interaction.guild.id, messageId);

                if (!messageConfig) {
                    await interaction.editReply({ content: '❌ This is not a reaction role message.', ephemeral: true });
                    return;
                }

                const type = messageConfig.type || 'buttons';

                // Add role to config
                addReactionRole(interaction.guild.id, messageId, emoji, role.id, messageConfig.mode);

                // Update the message
                const allRoles = getMessageReactionRoles(interaction.guild.id, messageId);
                const embed = message.embeds[0];
                
                if (type === 'buttons') {
                    // Create buttons
                    const buttons = [];
                    for (const [label, roleId] of Object.entries(allRoles.roles)) {
                        buttons.push(
                            new ButtonBuilder()
                                .setCustomId(`role_${roleId}`)
                                .setLabel(label)
                                .setStyle(ButtonStyle[style])
                        );
                    }

                    // Split into rows of 5 buttons max
                    const rows = [];
                    for (let i = 0; i < buttons.length; i += 5) {
                        rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
                    }

                    await message.edit({ embeds: [embed], components: rows });
                } else {
                    // Add reaction
                    await message.react(emoji);
                }

                await interaction.editReply({ 
                    content: `✅ Added **${role.name}** to the reaction role message!\n` +
                            `${type === 'reactions' ? `Emoji: ${emoji}` : `Button: ${emoji}`}`
                });
            } catch (error) {
                console.error('Error adding reaction role:', error);
                await interaction.editReply({ 
                    content: '❌ Failed to add role. Make sure the message ID is correct and in this channel.', 
                    ephemeral: true 
                });
            }
        } else if (subcommand === 'remove') {
            const messageId = interaction.options.getString('message-id');
            const emoji = interaction.options.getString('emoji');

            const success = removeReactionRole(interaction.guild.id, messageId, emoji);

            if (success) {
                try {
                    const message = await interaction.channel.messages.fetch(messageId);
                    const messageConfig = getMessageReactionRoles(interaction.guild.id, messageId);
                    
                    if (messageConfig) {
                        const type = messageConfig.type || 'buttons';
                        const embed = message.embeds[0];

                        if (type === 'buttons') {
                            // Rebuild buttons
                            const buttons = [];
                            for (const [label, roleId] of Object.entries(messageConfig.roles)) {
                                buttons.push(
                                    new ButtonBuilder()
                                        .setCustomId(`role_${roleId}`)
                                        .setLabel(label)
                                        .setStyle(ButtonStyle.Primary)
                                );
                            }

                            const rows = [];
                            for (let i = 0; i < buttons.length; i += 5) {
                                rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
                            }

                            await message.edit({ embeds: [embed], components: rows });
                        }
                    }

                    await interaction.editReply({ content: `✅ Removed reaction role for ${emoji}` });
                } catch (error) {
                    console.error('Error updating message:', error);
                    await interaction.editReply({ content: '✅ Removed from config, but couldn\'t update the message.' });
                }
            } else {
                await interaction.editReply({ content: '❌ Could not find that reaction role.', ephemeral: true });
            }
        } else if (subcommand === 'delete') {
            const messageId = interaction.options.getString('message-id');

            const success = deleteReactionRoleMessage(interaction.guild.id, messageId);

            if (success) {
                await interaction.editReply({ 
                    content: `✅ Deleted reaction role configuration for message \`${messageId}\`\n` +
                            `You can manually delete the message itself if needed.`
                });
            } else {
                await interaction.editReply({ content: '❌ Could not find that reaction role message.', ephemeral: true });
            }
        }
    }
};
