const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', '..', 'data', 'config.json');

function getConfig() {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcomer')
        .setDescription('Configure welcome and goodbye messages')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup welcome messages')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to send welcome messages')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Welcome message (use {user}, {username}, {server}, {membercount})')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('embed')
                        .setDescription('Send as embed? (default: true)')
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('auto-role')
                        .setDescription('Role to assign to new members')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('goodbye')
                .setDescription('Setup goodbye messages')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to send goodbye messages (optional, uses welcome channel)')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Goodbye message')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable goodbye messages?')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed-customize')
                .setDescription('Customize welcome embed')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Embed title')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Embed color (hex code, e.g., #00FF00)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('image')
                        .setDescription('Image URL for embed')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test the welcome message with yourself'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable welcome/goodbye messages'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('View current welcomer configuration'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const config = getConfig();
        const guildId = interaction.guild.id;

        if (!config[guildId]) config[guildId] = {};
        if (!config[guildId].welcomerConfig) {
            config[guildId].welcomerConfig = {
                enabled: false,
                channelId: null,
                message: 'Welcome {user} to {server}!',
                embedEnabled: true,
                embedTitle: '👋 Welcome!',
                embedColor: '#00FF00',
                embedImage: null,
                autoRoleId: null,
                goodbyeEnabled: false,
                goodbyeChannelId: null,
                goodbyeMessage: '{username} has left {server}. Goodbye!',
                goodbyeEmbedEnabled: true
            };
        }

        const welcomerConfig = config[guildId].welcomerConfig;

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message');
            const useEmbed = interaction.options.getBoolean('embed') ?? true;
            const autoRole = interaction.options.getRole('auto-role');

            welcomerConfig.enabled = true;
            welcomerConfig.channelId = channel.id;
            welcomerConfig.message = message;
            welcomerConfig.embedEnabled = useEmbed;
            if (autoRole) welcomerConfig.autoRoleId = autoRole.id;

            saveConfig(config);

            const embed = EmbedTemplate.success(
                'Welcomer Setup Complete',
                `**Channel:** ${channel}\n**Message:** ${message}\n**Format:** ${useEmbed ? 'Embed' : 'Plain text'}${autoRole ? `\n**Auto-Role:** ${autoRole}` : ''}`
            );
            embed.addFields({
                name: '📝 Available Placeholders',
                value: '`{user}` - User mention\n`{username}` - Username\n`{usertag}` - User#1234\n`{server}` - Server name\n`{membercount}` - Member count'
            });

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'goodbye') {
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message');
            const enabled = interaction.options.getBoolean('enabled');

            welcomerConfig.goodbyeEnabled = enabled;
            welcomerConfig.goodbyeMessage = message;
            if (channel) welcomerConfig.goodbyeChannelId = channel.id;

            saveConfig(config);

            const embed = EmbedTemplate.success(
                'Goodbye Messages Configured',
                `**Status:** ${enabled ? 'Enabled' : 'Disabled'}\n**Channel:** ${channel || 'Same as welcome channel'}\n**Message:** ${message}`
            );

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'embed-customize') {
            const title = interaction.options.getString('title');
            const color = interaction.options.getString('color');
            const image = interaction.options.getString('image');

            if (title) welcomerConfig.embedTitle = title;
            if (color) {
                if (!/^#[0-9A-F]{6}$/i.test(color)) {
                    const embed = EmbedTemplate.error('Invalid Color', 'Please use hex format: #00FF00');
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
                }
                welcomerConfig.embedColor = color;
            }
            if (image) welcomerConfig.embedImage = image;

            saveConfig(config);

            const embed = EmbedTemplate.success(
                'Embed Customized',
                `${title ? `**Title:** ${title}\n` : ''}${color ? `**Color:** ${color}\n` : ''}${image ? `**Image:** Set\n` : ''}Changes saved!`
            );

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'test') {
            if (!welcomerConfig.enabled) {
                const embed = EmbedTemplate.error('Welcomer Not Setup', 'Use `/welcomer setup` first!');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }

            const { sendWelcomeMessage } = require('../../utils/welcomer');
            await sendWelcomeMessage(interaction.member);

            const embed = EmbedTemplate.success('Test Sent', 'Check the welcome channel!');
            await interaction.editReply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'disable') {
            welcomerConfig.enabled = false;
            welcomerConfig.goodbyeEnabled = false;
            saveConfig(config);

            const embed = EmbedTemplate.success('Welcomer Disabled', 'Welcome and goodbye messages have been disabled.');
            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'config') {
            if (!welcomerConfig.enabled) {
                const embed = EmbedTemplate.warning('Welcomer Not Configured', 'Use `/welcomer setup` to enable.');
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const channel = await interaction.guild.channels.fetch(welcomerConfig.channelId).catch(() => null);
            const autoRole = welcomerConfig.autoRoleId ? await interaction.guild.roles.fetch(welcomerConfig.autoRoleId).catch(() => null) : null;

            const embed = EmbedTemplate.info('Welcomer Configuration', '👋 Current Settings');
            embed.addFields(
                { name: '📺 Channel', value: channel ? channel.toString() : '❌ Not found', inline: true },
                { name: '🟢 Status', value: 'Enabled', inline: true },
                { name: '📝 Format', value: welcomerConfig.embedEnabled ? 'Embed' : 'Plain', inline: true },
                { name: '💬 Message', value: welcomerConfig.message, inline: false }
            );

            if (autoRole) {
                embed.addFields({ name: '🎭 Auto-Role', value: autoRole.toString(), inline: true });
            }

            if (welcomerConfig.goodbyeEnabled) {
                const goodbyeChannel = welcomerConfig.goodbyeChannelId ? 
                    await interaction.guild.channels.fetch(welcomerConfig.goodbyeChannelId).catch(() => null) : 
                    channel;
                embed.addFields(
                    { name: '👋 Goodbye', value: 'Enabled', inline: true },
                    { name: '📺 Goodbye Channel', value: goodbyeChannel ? goodbyeChannel.toString() : channel.toString(), inline: true }
                );
            }

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
