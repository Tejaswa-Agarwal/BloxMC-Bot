const { SlashCommandBuilder } = require('discord.js');
const { buildHelpOverviewEmbed, buildHelpSelectRow } = require('../../utils/helpMenu');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands'),
    async execute(interaction) {
        const embed = buildHelpOverviewEmbed(interaction.client);
        const row = buildHelpSelectRow('overview');
        await interaction.editReply({ embeds: [embed], components: [row] });
    }
};
