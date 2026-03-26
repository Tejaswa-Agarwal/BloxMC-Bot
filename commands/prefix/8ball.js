const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: '8ball',
    description: 'Ask the magic 8ball a question',
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send('Usage: !8ball <question>');
        }

        const question = args.join(' ');
        
        const responses = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes - definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            "Don't count on it.",
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.'
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: '🔮 Magic 8Ball', iconURL: message.author.displayAvatarURL() })
            .setColor(0x9B59B6)
            .addFields(
                { name: '❓ Question', value: question, inline: false },
                { name: '🎱 Answer', value: `**${response}**`, inline: false }
            )
            .setFooter({ text: `Asked by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};