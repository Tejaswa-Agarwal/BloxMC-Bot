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
            .setAuthor({ name: `${user.username}'s Avatar`, iconURL: user.displayAvatarURL() })
            .setColor(0x9B59B6)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .addFields(
                { name: '🔗 Links', value: `[PNG](${user.displayAvatarURL({ extension: 'png', size: 2048 })}) • [JPG](${user.displayAvatarURL({ extension: 'jpg', size: 2048 })}) • [WEBP](${user.displayAvatarURL({ extension: 'webp', size: 2048 })})`, inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
