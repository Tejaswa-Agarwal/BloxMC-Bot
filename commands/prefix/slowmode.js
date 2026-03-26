module.exports = {
    name: 'slowmode',
    description: 'Set channel slowmode delay',
    async execute(message, args) {
        if (!message.guild) {
            return message.channel.send('This command can only be used in a server.');
        }

        if (args.length < 1) {
            return message.channel.send('Usage: !slowmode <seconds> [#channel]\nExample: !slowmode 10 #general');
        }

        const seconds = parseInt(args[0]);
        const channel = message.mentions.channels.first() || message.channel;

        if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            return message.channel.send('❌ Please provide a valid number between 0 and 21600 seconds.');
        }

        if (!channel.isTextBased()) {
            return message.channel.send('❌ This channel type does not support slowmode.');
        }

        try {
            await channel.setRateLimitPerUser(seconds);
            
            if (seconds === 0) {
                message.channel.send(`✅ Slowmode has been **disabled** in ${channel}`);
            } else {
                const formatted = seconds < 60 ? `${seconds} seconds` : 
                                 seconds < 3600 ? `${Math.floor(seconds / 60)} minutes` : 
                                 `${Math.floor(seconds / 3600)} hours`;
                message.channel.send(`✅ Slowmode set to **${formatted}** in ${channel}`);
            }
        } catch (error) {
            console.error('Error setting slowmode:', error);
            message.channel.send('❌ Failed to set slowmode. Make sure I have Manage Channels permission.');
        }
    }
};