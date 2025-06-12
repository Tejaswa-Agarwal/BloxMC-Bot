const { SlashCommandBuilder } = require('discord.js');
const { status } = require('minecraft-server-util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerlist')
        .setDescription('List all currently online players on the Minecraft server')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Select the server')
                .setRequired(true)
                .addChoices(
                    { name: 'lifesteal', value: 'lifesteal' },
                    { name: 'survival', value: 'survival' }
                )),
    async execute(interaction, serversRconConfig) {
        const serverName = interaction.options.getString('server').toLowerCase();

        const config = serversRconConfig[serverName];
        if (!config) {
            await interaction.reply(`Server "${serverName}" not found.`);
            return;
        }

        try {
            const result = await status(config.host, config.port, { timeout: 5000 });
            if (result.players.online === 0) {
            await interaction.editReply('No players are currently online.');
                return;
            }
            const playerNames = result.players.sample ? result.players.sample.map(p => p.name).join(', ') : 'Unknown';
            await interaction.editReply(`Online players (${result.players.online}/${result.players.max}): ${playerNames}`);
        } catch (error) {
            console.error('Error fetching player list:', error);
            await interaction.editReply('Failed to fetch player list. Is the server online?');
        }
    }
};
