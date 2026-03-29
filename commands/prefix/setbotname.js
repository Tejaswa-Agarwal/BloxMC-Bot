module.exports = {
    name: 'setbotname',
    description: 'Set a custom bot nickname for this server',
    usage: 'setbotname <nickname> (or leave empty to reset)',
    async execute(message, args) {
        if (!message.guild) {
            message.channel.send('❌ This command can only be used in a server.');
            return;
        }

        // Only guild owner or bot owner can use this command
        const BOT_OWNER_ID = '1124168034332975204';
        if (message.author.id !== message.guild.ownerId && message.author.id !== BOT_OWNER_ID) {
            message.channel.send('❌ Only the server owner or bot owner can customize the bot.');
            return;
        }

        const nickname = args.join(' ');

        try {
            const botMember = await message.guild.members.fetchMe();
            
            if (!nickname) {
                // Reset to default (no nickname)
                await botMember.setNickname(null);
                message.channel.send('✅ Bot nickname has been reset to default.');
            } else {
                await botMember.setNickname(nickname);
                message.channel.send(`✅ Bot nickname set to: **${nickname}**`);
            }
        } catch (error) {
            console.error('Error setting bot nickname:', error);
            
            if (error.code === 50013) {
                message.channel.send('❌ I don\'t have permission to change my nickname. Make sure I have the "Change Nickname" permission and my role is below the target role.');
            } else {
                message.channel.send('❌ Failed to set bot nickname. Please try again.');
            }
        }
    }
};
