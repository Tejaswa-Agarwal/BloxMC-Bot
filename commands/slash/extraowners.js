const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const configStore = require('../../configStore');
const { BOT_OWNER_ID, hasElevatedOwnership } = require('../../utils/permissions');

function getConfig(guildId) {
    const all = configStore.get('extraOwnersConfig') || {};
    const entry = all[guildId] || {};
    return {
        userIds: Array.isArray(entry.userIds) ? entry.userIds : [],
    };
}

function saveConfig(guildId, cfg) {
    const all = configStore.get('extraOwnersConfig') || {};
    all[guildId] = {
        userIds: Array.isArray(cfg.userIds) ? cfg.userIds : [],
    };
    configStore.set('extraOwnersConfig', all);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('extraowners')
        .setDescription('Manage extra server owners with full admin bypass')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add an extra owner')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to add')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove an extra owner')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to remove')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all extra owners'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const guildOwnerId = interaction.guild.ownerId;

        if (!(userId === BOT_OWNER_ID || userId === guildOwnerId || hasElevatedOwnership(guildId, userId, guildOwnerId))) {
            await interaction.editReply({
                embeds: [EmbedTemplate.error('No Permission', 'Only the guild owner, bot owner, or existing extra owners can manage extra owners.')],
                ephemeral: true,
            });
            return;
        }

        const sub = interaction.options.getSubcommand();
        const cfg = getConfig(guildId);

        if (sub === 'add') {
            const user = interaction.options.getUser('user');
            if (user.id === guildOwnerId || user.id === BOT_OWNER_ID) {
                await interaction.editReply({
                    embeds: [EmbedTemplate.warning('Already Elevated', 'That user is already a primary owner.')],
                    ephemeral: true,
                });
                return;
            }
            if (!cfg.userIds.includes(user.id)) cfg.userIds.push(user.id);
            saveConfig(guildId, cfg);
            await interaction.editReply({
                embeds: [EmbedTemplate.success('Extra Owner Added', `${user.tag} now has elevated ownership permissions.`)],
            });
            return;
        }

        if (sub === 'remove') {
            const user = interaction.options.getUser('user');
            cfg.userIds = cfg.userIds.filter(id => id !== user.id);
            saveConfig(guildId, cfg);
            await interaction.editReply({
                embeds: [EmbedTemplate.success('Extra Owner Removed', `${user.tag} no longer has elevated ownership permissions.`)],
            });
            return;
        }

        if (cfg.userIds.length === 0) {
            await interaction.editReply({
                embeds: [EmbedTemplate.info('Extra Owners', 'No extra owners configured for this server yet.')],
            });
            return;
        }

        const lines = await Promise.all(cfg.userIds.map(async (id) => {
            const member = await interaction.guild.members.fetch(id).catch(() => null);
            return member ? `• ${member.user.tag} (\`${id}\`)` : `• Unknown User (\`${id}\`)`;
        }));

        await interaction.editReply({
            embeds: [EmbedTemplate.info('Extra Owners', lines.join('\n').substring(0, 1024))],
        });
    },
};

