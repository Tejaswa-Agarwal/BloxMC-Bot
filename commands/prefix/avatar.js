const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Display user avatar',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${user.username}'s Avatar`, iconURL: user.displayAvatarURL() })
            .setColor(0x9B59B6)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .addFields(
                { name: '🔗 Links', value: `[PNG](${user.displayAvatarURL({ extension: 'png', size: 2048 })}) • [JPG](${user.displayAvatarURL({ extension: 'jpg', size: 2048 })}) • [WEBP](${user.displayAvatarURL({ extension: 'webp', size: 2048 })})`, inline: false }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
