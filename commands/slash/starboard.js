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
        .setName('starboard')
        .setDescription('Configure the starboard system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup the starboard')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to post starred messages')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('threshold')
                        .setDescription('Number of stars required (default: 3)')
                        .setMinValue(1)
                        .setMaxValue(20)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable the starboard'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('View current starboard configuration'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const config = getConfig();
        const guildId = interaction.guild.id;

        if (!config[guildId]) config[guildId] = {};
        if (!config[guildId].starboardConfig) {
            config[guildId].starboardConfig = {
                enabled: false,
                channelId: null,
                threshold: 3,
                messages: {}
            };
        }

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('channel');
            const threshold = interaction.options.getInteger('threshold') || 3;

            config[guildId].starboardConfig = {
                enabled: true,
                channelId: channel.id,
                threshold: threshold,
                messages: config[guildId].starboardConfig.messages || {}
            };

            saveConfig(config);

            const embed = EmbedTemplate.success(
                'Starboard Setup Complete',
                `**Channel:** ${channel}\n**Threshold:** ${threshold} ⭐\n\nMessages with ${threshold}+ star reactions will be posted to ${channel}.`
            );
            embed.addFields({ 
                name: 'How to Use', 
                value: 'React to any message with ⭐ to nominate it for the starboard!' 
            });

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'disable') {
            config[guildId].starboardConfig.enabled = false;
            saveConfig(config);

            const embed = EmbedTemplate.success(
                'Starboard Disabled',
                'The starboard has been disabled. Existing starred messages will remain.'
            );
            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'config') {
            const starConfig = config[guildId].starboardConfig;

            if (!starConfig.enabled) {
                const embed = EmbedTemplate.warning(
                    'Starboard Not Configured',
                    'Use `/starboard setup` to enable the starboard.'
                );
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const channel = await interaction.guild.channels.fetch(starConfig.channelId).catch(() => null);
            const messageCount = Object.keys(starConfig.messages || {}).length;

            const embed = EmbedTemplate.info('Starboard Configuration', '⭐ Current Settings');
            embed.addFields(
                { name: '📺 Channel', value: channel ? channel.toString() : '❌ Not found', inline: true },
                { name: '⭐ Threshold', value: `${starConfig.threshold} stars`, inline: true },
                { name: '📊 Starred Messages', value: `${messageCount}`, inline: true },
                { name: '🟢 Status', value: 'Enabled', inline: true }
            );

            await interaction.editReply({ embeds: [embed] });
        }
    }
};
