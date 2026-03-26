const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poll',
    description: 'Create a poll',
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send('Usage: !poll <question> | <option1> | <option2> | ...');
        }

        const pollParts = args.join(' ').split('|').map(part => part.trim()).filter(part => part.length > 0);
        
        if (pollParts.length < 3) {
            return message.channel.send('❌ Please provide a question and at least 2 options separated by |');
        }

        const question = pollParts[0];
        const options = pollParts.slice(1);

        if (options.length > 10) {
            return message.channel.send('❌ Maximum 10 options allowed');
        }

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        const optionsText = options.map((opt, index) => `${emojis[index]} ${opt}`).join('\n');

        const embed = new EmbedBuilder()
            .setAuthor({ name: '📊 Poll', iconURL: message.author.displayAvatarURL() })
            .setTitle(question)
            .setDescription(optionsText)
            .setColor(0xF1C40F)
            .setFooter({ text: `Poll created by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        const pollMessage = await message.channel.send({ embeds: [embed] });

        for (let i = 0; i < options.length; i++) {
            await pollMessage.react(emojis[i]);
        }

        if (message.guild) {
            await message.delete().catch(() => {});
        }
    }
};