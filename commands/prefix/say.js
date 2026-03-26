const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'Make the bot say something',
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send('Usage: !say <message>');
        }

        const messageContent = args.join(' ');

        try {
            await message.channel.send(messageContent);
            if (message.guild) {
                await message.delete().catch(() => {});
            }
        } catch (error) {
            console.error('Error sending message:', error);
            message.channel.send('❌ Failed to send message.');
        }
    }
};