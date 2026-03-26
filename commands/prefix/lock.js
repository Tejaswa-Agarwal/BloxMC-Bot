module.exports = {
    name: 'lock',
    description: 'Lock a channel',
    async execute(message, args) {
        if (!message.guild) {
            return message.channel.send('This command can only be used in a server.');
        }

        const channel = message.mentions.channels.first() || message.channel;
        const reason = args.join(' ') || 'No reason provided';

        if (!channel.isTextBased()) {
            return message.channel.send('❌ Cannot lock this channel type.');
        }

        try {
            await channel.permissionOverwrites.edit(message.guild.id, {
                SendMessages: false
            });
            
            message.channel.send(`🔒 ${channel} has been **locked**\nReason: ${reason}`);
            if (channel.id !== message.channel.id) {
                await channel.send(`🔒 This channel has been locked by ${message.author}\nReason: ${reason}`);
            }
        } catch (error) {
            console.error('Error locking channel:', error);
            message.channel.send('❌ Failed to lock channel. Make sure I have Manage Channels permission.');
        }
    }
};