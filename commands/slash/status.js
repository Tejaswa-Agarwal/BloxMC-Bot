const { status } = require('minecraft-server-util');
const { EmbedBuilder } = require('discord.js');

function createStatusEmbed(result) {
    const embed = new EmbedBuilder()
        .setTitle('Server Status')
        .setColor(0x00FF00)
        .setDescription('BloxMC\nServer Full Release Soon!')
        .addFields(
            { name: 'Status', value: 'Online', inline: true },
            { name: 'Player Count', value: `${result.players.online}/${result.players.max}`, inline: true },
            { name: 'Version', value: result.version.name, inline: true }
        );
    if (result.favicon) {
        embed.setThumbnail(result.favicon);
    }
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    embed.setFooter({ text: `BloxMC•Today at ${timeString}` });
    return embed;
}

module.exports = {
    data: {
        name: 'status',
        description: 'Get the current Minecraft server status',
    },
    async execute(interaction, config) {
        try {
            const result = await status(config.host, config.port, { timeout: 5000 });
            const embed = createStatusEmbed(result);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply('Minecraft server is offline or unreachable.');
        }
    }
};
