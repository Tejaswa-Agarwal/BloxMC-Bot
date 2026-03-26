const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roll',
    description: 'Roll a dice',
    async execute(message, args) {
        const sides = args[0] ? parseInt(args[0]) : 6;
        
        if (isNaN(sides) || sides < 2 || sides > 100) {
            return message.channel.send('❌ Please provide a valid number between 2 and 100 for dice sides.');
        }
        
        const result = Math.floor(Math.random() * sides) + 1;
        
        const embed = new EmbedBuilder()
            .setTitle('🎲 Dice Roll')
            .setDescription(`You rolled a **${result}** on a ${sides}-sided dice!`)
            .setColor(0xE74C3C)
            .setFooter({ text: `Rolled by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};