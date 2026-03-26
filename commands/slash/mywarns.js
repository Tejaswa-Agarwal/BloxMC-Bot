const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsFile = path.join(__dirname, '..', '..', 'data', 'warnings.json');

function loadWarnings() {
    if (fs.existsSync(warningsFile)) {
        return JSON.parse(fs.readFileSync(warningsFile, 'utf8'));
    }
    return {};
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mywarns')
        .setDescription('Check your own warnings'),
    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const warnings = loadWarnings();
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const userWarnings = warnings[guildId]?.[userId] || [];

        if (userWarnings.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Your Warnings')
                .setDescription('You have no warnings! 🎉')
                .setColor(0x2ECC71)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        const warningsList = userWarnings.map((w, index) => {
            return `**${index + 1}.** ${w.reason}\n📅 <t:${Math.floor(w.timestamp / 1000)}:R> by ${w.moderator}\n🆔 ID: \`${w.id}\``;
        }).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Your Warnings')
            .setDescription(`**Total Warnings:** ${userWarnings.length}\n\n${warningsList}`)
            .setColor(0xE74C3C)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: 'Contact a moderator if you believe any warnings are incorrect' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    }
};