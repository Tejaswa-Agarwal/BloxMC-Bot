const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const { hasAdminPermission } = require('../../utils/permissions');
const { getSecurityConfig, setSecurityConfig } = require('../../utils/securityShield');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('security')
        .setDescription('Wick-style security shield controls')
        .addSubcommand(sub =>
            sub.setName('enable')
                .setDescription('Enable security shield'))
        .addSubcommand(sub =>
            sub.setName('disable')
                .setDescription('Disable security shield'))
        .addSubcommand(sub =>
            sub.setName('config')
                .setDescription('View security shield config'))
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Update anti-alt and join-guard settings')
                .addIntegerOption(option =>
                    option.setName('min-account-age')
                        .setDescription('Minimum account age in days (anti-alt)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(90))
                .addStringOption(option =>
                    option.setName('anti-alt-action')
                        .setDescription('Action for young accounts')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Kick', value: 'kick' },
                            { name: 'Quarantine Role', value: 'quarantine' },
                            { name: 'Alert Only', value: 'alert' }
                        ))
                .addIntegerOption(option =>
                    option.setName('join-threshold')
                        .setDescription('Max joins before join guard trigger')
                        .setRequired(false)
                        .setMinValue(3)
                        .setMaxValue(50))
                .addIntegerOption(option =>
                    option.setName('join-window')
                        .setDescription('Join guard time window in seconds')
                        .setRequired(false)
                        .setMinValue(5)
                        .setMaxValue(120))
                .addStringOption(option =>
                    option.setName('join-action')
                        .setDescription('Action when join guard triggers')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Alert', value: 'alert' },
                            { name: 'Kick new joins', value: 'kick' }
                        ))
                .addRoleOption(option =>
                    option.setName('quarantine-role')
                        .setDescription('Role used when anti-alt action is quarantine')
                        .setRequired(false))),
        async execute(interaction) {
            if (!interaction.guild) {
                await interaction.editReply({ embeds: [EmbedTemplate.error('Server Only', 'This command can only be used in a server.')], ephemeral: true });
                return;
            }

            if (!hasAdminPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
                await interaction.editReply({ embeds: [EmbedTemplate.error('No Permission', 'Only admins can configure security shield.')], ephemeral: true });
                return;
            }

            const sub = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;
            const current = getSecurityConfig(guildId);

            if (sub === 'enable') {
                setSecurityConfig(guildId, { ...current, enabled: true });
                await interaction.editReply({ embeds: [EmbedTemplate.success('Security Shield Enabled', 'Wick-style protections are now active.')] });
                return;
            }

            if (sub === 'disable') {
                setSecurityConfig(guildId, { ...current, enabled: false });
                await interaction.editReply({ embeds: [EmbedTemplate.warning('Security Shield Disabled', 'Security shield has been disabled.')] });
                return;
            }

            if (sub === 'set') {
                const minAccountAge = interaction.options.getInteger('min-account-age');
                const antiAltAction = interaction.options.getString('anti-alt-action');
                const joinThreshold = interaction.options.getInteger('join-threshold');
                const joinWindow = interaction.options.getInteger('join-window');
                const joinAction = interaction.options.getString('join-action');
                const quarantineRole = interaction.options.getRole('quarantine-role');

                const next = {
                    ...current,
                    antiAlt: {
                        ...current.antiAlt,
                        minAccountAgeDays: minAccountAge ?? current.antiAlt.minAccountAgeDays,
                        action: antiAltAction ?? current.antiAlt.action,
                    },
                    joinGuard: {
                        ...current.joinGuard,
                        maxJoins: joinThreshold ?? current.joinGuard.maxJoins,
                        windowMs: joinWindow ? joinWindow * 1000 : current.joinGuard.windowMs,
                        action: joinAction ?? current.joinGuard.action,
                    },
                    quarantineRoleId: quarantineRole ? quarantineRole.id : current.quarantineRoleId,
                };

                setSecurityConfig(guildId, next);
                await interaction.editReply({
                    embeds: [EmbedTemplate.success(
                        'Security Settings Updated',
                        `**Anti-alt age:** ${next.antiAlt.minAccountAgeDays}d\n**Anti-alt action:** ${next.antiAlt.action}\n**Join guard:** ${next.joinGuard.maxJoins} joins / ${Math.round(next.joinGuard.windowMs / 1000)}s\n**Join action:** ${next.joinGuard.action}`
                    )],
                });
                return;
            }

            const cfg = getSecurityConfig(guildId);
            await interaction.editReply({
                embeds: [EmbedTemplate.info(
                    'Security Shield Config',
                    `**Status:** ${cfg.enabled ? 'Enabled' : 'Disabled'}\n**Anti-alt:** ${cfg.antiAlt.enabled ? 'On' : 'Off'} (${cfg.antiAlt.minAccountAgeDays}d, ${cfg.antiAlt.action})\n**Join guard:** ${cfg.joinGuard.enabled ? 'On' : 'Off'} (${cfg.joinGuard.maxJoins}/${Math.round(cfg.joinGuard.windowMs / 1000)}s, ${cfg.joinGuard.action})\n**Quarantine Role:** ${cfg.quarantineRoleId ? `<@&${cfg.quarantineRoleId}>` : 'Not set'}`
                )],
            });
        },
};

