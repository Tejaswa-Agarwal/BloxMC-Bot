const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const { setVerifyConfig, getVerifyConfig, sendVerifyPanel } = require('../../utils/verification');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Configure member verification')
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('Set verification role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to grant when verified')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('panel')
                .setDescription('Send verification panel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for panel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Panel title')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Panel description')
                        .setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('disable')
                .setDescription('Disable verification'))
        .addSubcommand(sub =>
            sub.setName('config')
                .setDescription('View verification config'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'setup') {
            const role = interaction.options.getRole('role');
            const current = getVerifyConfig(guildId) || {};
            setVerifyConfig(guildId, {
                ...current,
                enabled: true,
                roleId: role.id,
            });

            await interaction.editReply({
                embeds: [EmbedTemplate.success('Verification Configured', `Members will receive ${role} after verifying.`)],
            });
            return;
        }

        if (sub === 'panel') {
            const verifyConfig = getVerifyConfig(guildId);
            if (!verifyConfig?.enabled || !verifyConfig?.roleId) {
                await interaction.editReply({
                    embeds: [EmbedTemplate.error('Not Configured', 'Run `/verify setup` first.')],
                });
                return;
            }

            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const message = await sendVerifyPanel(channel, title, description);

            await interaction.editReply({
                embeds: [EmbedTemplate.success('Panel Sent', `Verification panel sent in ${channel}\n[Jump to panel](${message.url})`)],
            });
            return;
        }

        if (sub === 'disable') {
            const current = getVerifyConfig(guildId) || {};
            setVerifyConfig(guildId, { ...current, enabled: false });
            await interaction.editReply({
                embeds: [EmbedTemplate.success('Verification Disabled', 'Verification is now disabled.')],
            });
            return;
        }

        const config = getVerifyConfig(guildId);
        if (!config) {
            await interaction.editReply({
                embeds: [EmbedTemplate.warning('No Config', 'Verification is not configured.')],
            });
            return;
        }

        const role = interaction.guild.roles.cache.get(config.roleId);
        await interaction.editReply({
            embeds: [EmbedTemplate.info('Verification Config', `**Status:** ${config.enabled ? 'Enabled' : 'Disabled'}\n**Role:** ${role || 'Not found'}`)],
        });
    },
};

