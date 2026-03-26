const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the Discord server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);
            await interaction.editReply({ content: `✅ Kicked **${user.tag}** (${user.id})\nReason: ${reason}` });
        } catch (error) {
            console.error('Error kicking user:', error);
            await interaction.editReply({ content: 'Failed to kick user. Make sure I have the Kick Members permission.', ephemeral: true });
        }
    }
};
