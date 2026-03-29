const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const { addNote, getUserNotes, removeNote } = require('../../utils/notes');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Staff notes for users')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a note to a user')
                .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
                .addStringOption(opt => opt.setName('note').setDescription('Note content').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View notes for a user')
                .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a note by ID')
                .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
                .addStringOption(opt => opt.setName('noteid').setDescription('Note ID').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;

        if (sub === 'add') {
            const note = interaction.options.getString('note');
            const created = addNote(guildId, user.id, interaction.user.id, interaction.user.tag, note);
            await interaction.editReply({
                embeds: [EmbedTemplate.success('Note Added', `Added note for ${user.tag}\n**Note ID:** \`${created.id}\``)],
            });
            return;
        }

        if (sub === 'view') {
            const notes = getUserNotes(guildId, user.id);
            if (notes.length === 0) {
                await interaction.editReply({
                    embeds: [EmbedTemplate.warning('No Notes', `No notes found for ${user.tag}.`)],
                });
                return;
            }

            const lines = notes.slice(-10).reverse().map(n =>
                `**ID:** \`${n.id}\`\n**By:** ${n.moderatorTag}\n**When:** <t:${Math.floor(n.timestamp / 1000)}:R>\n**Note:** ${n.note}`,
            );

            await interaction.editReply({
                embeds: [EmbedTemplate.info(`Notes for ${user.tag}`, lines.join('\n\n'))],
            });
            return;
        }

        const noteId = interaction.options.getString('noteid');
        const removed = removeNote(guildId, user.id, noteId);
        if (!removed) {
            await interaction.editReply({ embeds: [EmbedTemplate.error('Remove Failed', 'Note ID not found.')] });
            return;
        }
        await interaction.editReply({ embeds: [EmbedTemplate.success('Note Removed', `Removed note \`${noteId}\` for ${user.tag}.`)] });
    },
};

