const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display user avatar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose avatar to display')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        
        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setColor(0x0099FF)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`[Download](${user.displayAvatarURL({ dynamic: true, size: 1024 })})`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
