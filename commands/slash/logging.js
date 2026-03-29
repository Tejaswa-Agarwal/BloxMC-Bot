const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setLogConfig, getLogConfig } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logging')
        .setDescription('Configure logging channels for this server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up logging channels')
                .addChannelOption(option =>
                    option.setName('message-log')
                        .setDescription('Channel for message edits/deletes')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('member-log')
                        .setDescription('Channel for member joins/leaves/updates')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('voice-log')
                        .setDescription('Channel for voice activity')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('mod-log')
                        .setDescription('Channel for moderation actions')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('server-log')
                        .setDescription('Channel for server/channel updates')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current logging configuration'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable a specific log type')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of log to disable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Message Log', value: 'messageLog' },
                            { name: 'Member Log', value: 'memberLog' },
                            { name: 'Voice Log', value: 'voiceLog' },
                            { name: 'Mod Log', value: 'modLog' },
                            { name: 'Server Log', value: 'serverLog' },
                            { name: 'All Logs', value: 'all' }
                        )))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in a server.', ephemeral: true });
            return;
        }

        const { hasAdminPermission } = require('../../utils/permissions');
        if (!hasAdminPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
            await interaction.editReply({ content: '❌ Only admins can configure logging.', ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const config = getLogConfig(interaction.guild.id) || {};

            const messageLog = interaction.options.getChannel('message-log');
            const memberLog = interaction.options.getChannel('member-log');
            const voiceLog = interaction.options.getChannel('voice-log');
            const modLog = interaction.options.getChannel('mod-log');
            const serverLog = interaction.options.getChannel('server-log');

            if (messageLog) config.messageLog = messageLog.id;
            if (memberLog) config.memberLog = memberLog.id;
            if (voiceLog) config.voiceLog = voiceLog.id;
            if (modLog) config.modLog = modLog.id;
            if (serverLog) config.serverLog = serverLog.id;

            setLogConfig(interaction.guild.id, config);

            let response = '✅ **Logging Configuration Updated**\n\n';
            if (messageLog) response += `📝 **Message Log:** ${messageLog}\n`;
            if (memberLog) response += `👥 **Member Log:** ${memberLog}\n`;
            if (voiceLog) response += `🔊 **Voice Log:** ${voiceLog}\n`;
            if (modLog) response += `🛡️ **Mod Log:** ${modLog}\n`;
            if (serverLog) response += `⚙️ **Server Log:** ${serverLog}\n`;

            if (!messageLog && !memberLog && !voiceLog && !modLog && !serverLog) {
                response = '⚠️ No logging channels were provided. Use the options to set up logging.';
            }

            await interaction.editReply({ content: response });
        } else if (subcommand === 'view') {
            const config = getLogConfig(interaction.guild.id);

            if (!config || Object.keys(config).length === 0) {
                await interaction.editReply({ content: '⚠️ Logging is not configured for this server.' });
                return;
            }

            let response = '📊 **Current Logging Configuration**\n\n';
            if (config.messageLog) response += `📝 **Message Log:** <#${config.messageLog}>\n`;
            if (config.memberLog) response += `👥 **Member Log:** <#${config.memberLog}>\n`;
            if (config.voiceLog) response += `🔊 **Voice Log:** <#${config.voiceLog}>\n`;
            if (config.modLog) response += `🛡️ **Mod Log:** <#${config.modLog}>\n`;
            if (config.serverLog) response += `⚙️ **Server Log:** <#${config.serverLog}>\n`;

            await interaction.editReply({ content: response });
        } else if (subcommand === 'disable') {
            const type = interaction.options.getString('type');
            const config = getLogConfig(interaction.guild.id) || {};

            if (type === 'all') {
                setLogConfig(interaction.guild.id, {});
                await interaction.editReply({ content: '✅ All logging has been disabled.' });
            } else {
                delete config[type];
                setLogConfig(interaction.guild.id, config);

                const names = {
                    messageLog: 'Message Log',
                    memberLog: 'Member Log',
                    voiceLog: 'Voice Log',
                    modLog: 'Mod Log',
                    serverLog: 'Server Log'
                };

                await interaction.editReply({ content: `✅ ${names[type]} has been disabled.` });
            }
        }
    }
};
