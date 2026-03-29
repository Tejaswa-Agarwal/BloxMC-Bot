const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const { getGuildTags, createTag, editTag, deleteTag, useTag } = require('../../utils/tags');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tags')
        .setDescription('Custom server tags')
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a tag')
                .addStringOption(opt => opt.setName('name').setDescription('Tag name').setRequired(true))
                .addStringOption(opt => opt.setName('content').setDescription('Tag content').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('show')
                .setDescription('Show a tag')
                .addStringOption(opt => opt.setName('name').setDescription('Tag name').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Edit a tag')
                .addStringOption(opt => opt.setName('name').setDescription('Tag name').setRequired(true))
                .addStringOption(opt => opt.setName('content').setDescription('New content').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a tag')
                .addStringOption(opt => opt.setName('name').setDescription('Tag name').setRequired(true)))
        .addSubcommand(sub => sub.setName('list').setDescription('List all tags'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'create') {
            const name = interaction.options.getString('name');
            const content = interaction.options.getString('content');
            const res = createTag(guildId, name, content, interaction.user.id);
            if (!res.success) {
                await interaction.editReply({ embeds: [EmbedTemplate.error('Tag Create Failed', res.error)] });
                return;
            }
            await interaction.editReply({ embeds: [EmbedTemplate.success('Tag Created', `Tag \`${name}\` created.`)] });
            return;
        }

        if (sub === 'show') {
            const name = interaction.options.getString('name');
            const tag = useTag(guildId, name);
            if (!tag) {
                await interaction.editReply({ embeds: [EmbedTemplate.error('Tag Not Found', `No tag named \`${name}\`.`)] });
                return;
            }
            await interaction.editReply({
                embeds: [EmbedTemplate.info(`Tag: ${name}`, tag.content, [
                    { name: 'Uses', value: String(tag.uses || 0), inline: true },
                    { name: 'Created', value: `<t:${Math.floor(tag.createdAt / 1000)}:R>`, inline: true },
                ])],
            });
            return;
        }

        if (sub === 'edit') {
            const name = interaction.options.getString('name');
            const content = interaction.options.getString('content');
            const res = editTag(guildId, name, content);
            if (!res.success) {
                await interaction.editReply({ embeds: [EmbedTemplate.error('Tag Edit Failed', res.error)] });
                return;
            }
            await interaction.editReply({ embeds: [EmbedTemplate.success('Tag Updated', `Tag \`${name}\` updated.`)] });
            return;
        }

        if (sub === 'delete') {
            const name = interaction.options.getString('name');
            const res = deleteTag(guildId, name);
            if (!res.success) {
                await interaction.editReply({ embeds: [EmbedTemplate.error('Tag Delete Failed', res.error)] });
                return;
            }
            await interaction.editReply({ embeds: [EmbedTemplate.success('Tag Deleted', `Tag \`${name}\` deleted.`)] });
            return;
        }

        const tags = getGuildTags(guildId);
        const names = Object.keys(tags);
        if (names.length === 0) {
            await interaction.editReply({ embeds: [EmbedTemplate.warning('No Tags', 'No tags created yet.')] });
            return;
        }
        await interaction.editReply({
            embeds: [EmbedTemplate.info('Server Tags', names.slice(0, 50).map(n => `• \`${n}\``).join('\n'))],
        });
    },
};

