const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const configStore = require('../../configStore');
const { hasAdminPermission } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('audit')
        .setDescription('Check server setup health and module coverage')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({
                embeds: [EmbedTemplate.error('Server Only', 'This command can only be used in a server.')],
                ephemeral: true,
            });
            return;
        }

        if (!hasAdminPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
            await interaction.editReply({
                embeds: [EmbedTemplate.error('No Permission', 'Only admins can run server audits.')],
                ephemeral: true,
            });
            return;
        }

        const guildId = interaction.guild.id;
        const guildRoot = configStore.get(guildId) || {};
        const roleConfig = (configStore.get('roleConfig') || {})[guildId] || {};
        const automodConfig = (configStore.get('automodConfig') || {})[guildId] || {};
        const antiNukeConfig = (configStore.get('antiNukeConfig') || {})[guildId] || {};
        const securityShieldConfig = (configStore.get('securityShieldConfig') || {})[guildId] || {};
        const ticketConfig = (configStore.get('ticketConfig') || {})[guildId] || {};
        const logConfig = (configStore.get('logConfig') || {})[guildId] || {};

        const checks = [
            { label: 'Staff roles configured', ok: !!(roleConfig.moderatorRoleId && roleConfig.adminRoleId) },
            { label: 'Automod enabled', ok: !!automodConfig.enabled },
            { label: 'Anti-nuke enabled', ok: !!antiNukeConfig.enabled },
            { label: 'Security shield enabled', ok: !!securityShieldConfig.enabled },
            { label: 'Logging configured', ok: !!(logConfig.modLog || logConfig.messageLog || logConfig.memberLog) },
            { label: 'Ticket system enabled', ok: !!ticketConfig.enabled },
            { label: 'Welcomer enabled', ok: !!guildRoot.welcomerConfig?.enabled },
            { label: 'Starboard enabled', ok: !!guildRoot.starboardConfig?.enabled },
            { label: 'Suggestions enabled', ok: !!guildRoot.suggestionConfig?.enabled },
            { label: 'Verification enabled', ok: !!guildRoot.verifyConfig?.enabled },
        ];

        const passed = checks.filter(c => c.ok).length;
        const score = Math.round((passed / checks.length) * 100);

        const recommendations = [];
        if (!roleConfig.moderatorRoleId || !roleConfig.adminRoleId) recommendations.push('Run `/setuproles` to lock moderation/admin command access.');
        if (!automodConfig.enabled) recommendations.push('Enable `/automod enable` for baseline anti-spam and abuse protection.');
        if (!antiNukeConfig.enabled) recommendations.push('Enable `/antinuke enable` to protect against channel/role nukes.');
        if (!securityShieldConfig.enabled) recommendations.push('Enable `/security enable` for anti-alt and join-raid protection.');
        if (!logConfig.modLog) recommendations.push('Set `/logging setup` so moderation actions are tracked.');
        if (!ticketConfig.enabled) recommendations.push('Set up `/ticket-setup` for member support flow.');

        const embed = EmbedTemplate.custom({
            color: score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444',
            title: `Server Audit • ${interaction.guild.name}`,
            description: `Health score: **${score}%** (${passed}/${checks.length} checks passed)`,
            fields: [
                {
                    name: 'Checks',
                    value: checks.map(c => `${c.ok ? '✅' : '❌'} ${c.label}`).join('\n').substring(0, 1024),
                    inline: false,
                },
                {
                    name: 'Recommended next steps',
                    value: recommendations.length
                        ? recommendations.map(r => `• ${r}`).join('\n').substring(0, 1024)
                        : 'Everything essential is configured. Nice work.',
                    inline: false,
                },
            ],
            timestamp: true,
            footer: {
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            },
        });

        await interaction.editReply({ embeds: [embed] });
    },
};
