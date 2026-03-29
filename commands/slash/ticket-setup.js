const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { setTicketConfig } = require('../../utils/ticketManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Configure the ticket system for this server')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('The category where ticket channels will be created')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('support-role')
                .setDescription('The role that can view and manage tickets')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('panel-channel')
                .setDescription('Channel where the ticket creation panel will be sent')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in a server.', ephemeral: true });
            return;
        }

        const { hasAdminPermission } = require('../../utils/permissions');
        if (!hasAdminPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
            await interaction.editReply({ content: '❌ Only admins can configure the ticket system.', ephemeral: true });
            return;
        }

        const category = interaction.options.getChannel('category');
        const supportRole = interaction.options.getRole('support-role');
        const panelChannel = interaction.options.getChannel('panel-channel');

        // Save configuration
        const config = {
            enabled: true,
            categoryId: category.id,
            supportRoleIds: [supportRole.id],
            counter: 0,
            openTickets: {}
        };

        setTicketConfig(interaction.guild.id, config);

        // Create ticket panel if channel provided
        if (panelChannel) {
            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🎫 Support Tickets')
                .setDescription(
                    '**Need help?** Create a support ticket!\n\n' +
                    'Click the button below to open a private ticket channel.\n' +
                    'Our support team will assist you as soon as possible.\n\n' +
                    '**What to expect:**\n' +
                    '• A private channel will be created for you\n' +
                    '• Support staff will be notified\n' +
                    '• You can close the ticket anytime'
                )
                .setFooter({ text: `${interaction.guild.name} Support`, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket')
                        .setLabel('Create Ticket')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🎫')
                );

            try {
                await panelChannel.send({ embeds: [embed], components: [row] });
                await interaction.editReply({ 
                    content: `✅ **Ticket system configured!**\n\n` +
                            `**Category:** ${category}\n` +
                            `**Support Role:** ${supportRole}\n` +
                            `**Panel Channel:** ${panelChannel}\n\n` +
                            `Users can now create tickets using the panel or \`/ticket create\` command.`
                });
            } catch (error) {
                console.error('Error sending ticket panel:', error);
                await interaction.editReply({ 
                    content: `⚠️ Ticket system configured, but couldn't send panel to ${panelChannel}. Make sure I have permission to send messages there.\n\n` +
                            `**Category:** ${category}\n` +
                            `**Support Role:** ${supportRole}`
                });
            }
        } else {
            await interaction.editReply({ 
                content: `✅ **Ticket system configured!**\n\n` +
                        `**Category:** ${category}\n` +
                        `**Support Role:** ${supportRole}\n\n` +
                        `Users can create tickets using \`/ticket create\` command.\n` +
                        `Run this command again with a panel-channel to set up a ticket creation panel.`
            });
        }
    }
};
