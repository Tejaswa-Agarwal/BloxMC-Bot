const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../../utils/modLog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the Discord server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(user.id, { reason: `${reason} | Banned by ${interaction.user.tag}` });
            await interaction.editReply({ content: `✅ Banned **${user.tag}** (${user.id})\nReason: ${reason}` });
            
            // Send to mod log
            await sendModLog(interaction.guild, 'ban', interaction.user, user, reason);
        } catch (error) {
            console.error('Error banning user:', error);
            await interaction.editReply({ content: 'Failed to ban user. Make sure I have the Ban Members permission.', ephemeral: true });
        }
    }
};
