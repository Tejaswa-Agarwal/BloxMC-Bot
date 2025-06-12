const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    name: 'embedmessage',
    description: 'Send an embed message to a channel',
    usage: '!embedmessage <#channel> <title> | <description> | <color>',
    async execute(message, args) {
if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
    return message.reply('You do not have permission to use this command.');
}

        if (args.length < 1) {
            return message.reply('Usage: !embedmessage <#channel> <title> | <description> | <color>');
        }

        const channelMention = args[0];
        const channelId = channelMention.replace(/[<#>]/g, '');
        const targetChannel = message.guild.channels.cache.get(channelId);

        if (!targetChannel) {
            return message.reply('Please mention a valid channel.');
        }

        const content = args.slice(1).join(' ').split('|').map(s => s.trim());
        const title = content[0] || 'No Title';
        const description = content[1] || 'No Description';
        const color = content[2] || '#0099ff';

        const embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        targetChannel.send({ embeds: [embed] });
        message.reply('Embed message sent successfully.');
    }
};
