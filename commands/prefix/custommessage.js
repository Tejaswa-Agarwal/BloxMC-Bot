const { Permissions } = require('discord.js');

module.exports = {
    name: 'custommessage',
    description: 'Send a custom message to a channel',
    usage: '!custommessage <#channel> <message>',
    async execute(message, args) {
if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return message.reply('You do not have permission to use this command.');
}

        if (args.length < 2) {
            return message.reply('Usage: !custommessage <#channel> <message>');
        }

        const channelMention = args[0];
        const channelId = channelMention.replace(/[<#>]/g, '');
        const targetChannel = message.guild.channels.cache.get(channelId);

        if (!targetChannel) {
            return message.reply('Please mention a valid channel.');
        }

        const customMessage = args.slice(1).join(' ');
        targetChannel.send(customMessage);
        message.reply('Message sent successfully.');
    }
};
