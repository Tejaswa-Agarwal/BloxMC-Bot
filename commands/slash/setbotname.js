const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbotname')
        .setDescription('Set a custom bot nickname for this server')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('The nickname for the bot in this server (leave empty to reset)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in a server.', ephemeral: true });
            return;
        }

        // Only guild owner or bot owner can use this command
        const BOT_OWNER_ID = '1124168034332975204';
        if (interaction.user.id !== interaction.guild.ownerId && interaction.user.id !== BOT_OWNER_ID) {
            await interaction.editReply({ content: '❌ Only the server owner or bot owner can customize the bot.', ephemeral: true });
            return;
        }

        const nickname = interaction.options.getString('nickname');

        try {
            const botMember = await interaction.guild.members.fetchMe();
            
            if (!nickname) {
                // Reset to default (no nickname)
                await botMember.setNickname(null);
                await interaction.editReply({ content: '✅ Bot nickname has been reset to default.' });
            } else {
                await botMember.setNickname(nickname);
                await interaction.editReply({ content: `✅ Bot nickname set to: **${nickname}**` });
            }
        } catch (error) {
            console.error('Error setting bot nickname:', error);
            
            if (error.code === 50013) {
                await interaction.editReply({ content: '❌ I don\'t have permission to change my nickname. Make sure I have the "Change Nickname" permission and my role is below the target role.', ephemeral: true });
            } else {
                await interaction.editReply({ content: '❌ Failed to set bot nickname. Please try again.', ephemeral: true });
            }
        }
    }
};
