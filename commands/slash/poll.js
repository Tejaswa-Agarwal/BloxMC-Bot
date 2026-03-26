const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Poll options (separate with |, max 10)')
                .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options');
        const options = optionsString.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

        if (options.length < 2) {
            return interaction.editReply({ content: '❌ Please provide at least 2 options separated by |', ephemeral: true });
        }

        if (options.length > 10) {
            return interaction.editReply({ content: '❌ Maximum 10 options allowed', ephemeral: true });
        }

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        const optionsText = options.map((opt, index) => `${emojis[index]} ${opt}`).join('\n');

        const embed = new EmbedBuilder()
            .setAuthor({ name: '📊 Poll', iconURL: interaction.user.displayAvatarURL() })
            .setTitle(question)
            .setDescription(optionsText)
            .setColor(0xF1C40F)
            .setFooter({ text: `Poll created by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        const message = await interaction.fetchReply();

        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    }
};