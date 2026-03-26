const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the Discord server')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The user ID to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the unban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const bannedUsers = await interaction.guild.bans.fetch();
            const bannedUser = bannedUsers.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                await interaction.editReply({ content: 'User is not banned or user ID not found.', ephemeral: true });
                return;
            }

            await interaction.guild.members.unban(userId, `${reason} | Unbanned by ${interaction.user.tag}`);
            await interaction.editReply({ content: `✅ Unbanned **${bannedUser.user.tag}** (${userId})\nReason: ${reason}` });
        } catch (error) {
            console.error('Error unbanning user:', error);
            await interaction.editReply({ content: 'Failed to unban user. Make sure I have the Ban Members permission.', ephemeral: true });
        }
    }
};
