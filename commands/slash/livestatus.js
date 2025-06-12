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
        name: 'livestatus',
        description: 'Start live status updates to a channel',
        options: [
            {
                type: 7, // Channel type
                name: 'channel',
                description: 'The channel to send live status updates to',
                required: true,
            },
        ],
    },
    async execute(interaction, config, liveStatusIntervalRef) {
        const targetChannel = interaction.options.getChannel('channel');

        if (liveStatusIntervalRef.current) {
            clearInterval(liveStatusIntervalRef.current);
            liveStatusIntervalRef.current = null;
        }

        let statusMessage = await interaction.editReply(`Starting live status updates to channel: ${targetChannel.name}`);

        liveStatusIntervalRef.current = setInterval(async () => {
            try {
                const result = await status(config.host, config.port, { timeout: 5000 });
                const embed = createStatusEmbed(result);
                statusMessage = await statusMessage.edit({ embeds: [embed] });
            } catch (error) {
                console.error('Error sending live status update:', error);
                statusMessage = await statusMessage.edit('Minecraft server is offline or unreachable.');
            }
        }, 2 * 60 * 1000); // every 2 minutes
    }
};
