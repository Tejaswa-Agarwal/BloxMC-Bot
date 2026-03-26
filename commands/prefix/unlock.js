const { sendModLog } = require('../../utils/modLog');

module.exports = {
    name: 'unlock',
    description: 'Unlock a channel',
    async execute(message, args) {
        if (!message.guild) {
            return message.channel.send('This command can only be used in a server.');
        }

        const channel = message.mentions.channels.first() || message.channel;

        if (!channel.isTextBased()) {
            return message.channel.send('❌ Cannot unlock this channel type.');
        }

        try {
            await channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: null
            });
            
            message.channel.send(`🔓 ${channel} has been **unlocked**`);
            if (channel.id !== message.channel.id) {
                await channel.send(`🔓 This channel has been unlocked by ${message.author}`);
            }
            
            // Send to mod log
            await sendModLog(message.guild, 'unlock', message.author, `#${channel.name}`, 'Channel unlocked', { '📍 Channel': channel.toString() });
        } catch (error) {
            console.error('Error unlocking channel:', error);
            message.channel.send('❌ Failed to unlock channel. Make sure I have Manage Channels permission.');
        }
    }
};