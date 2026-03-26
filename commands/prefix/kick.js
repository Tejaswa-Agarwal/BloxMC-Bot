const { sendModLog } = require('../utils/modLog');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the Discord server',
    async execute(message, args) {
        if (!message.guild) {
            message.channel.send('This command can only be used in a server.');
            return;
        }

        if (args.length < 1) {
            message.channel.send('Usage: k!kick <@user|userID> [reason]');
            return;
        }

        const userMention = args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';

        // Extract user ID from mention or direct ID
        const userId = userMention.replace(/[<@!>]/g, '');
        
        try {
            const member = await message.guild.members.fetch(userId);
            await member.kick(`${reason} | Kicked by ${message.author.tag}`);
            message.channel.send(`✅ Kicked **${member.user.tag}** (${member.id})\nReason: ${reason}`);
            
            // Send to mod log
            await sendModLog(message.guild, 'kick', message.author, member.user, reason);
        } catch (error) {
            console.error('Error kicking user:', error);
            message.channel.send('Failed to kick user. Make sure I have the Kick Members permission and the user is in the server.');
        }
    }
};
