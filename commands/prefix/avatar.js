const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Display user avatar',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        
        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setColor(0x0099FF)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`[Download](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
