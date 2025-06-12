const { status } = require('minecraft-server-util');

module.exports = {
    name: 'playerlist',
    description: 'List all currently online players on the Minecraft server',
    async execute(message, args, serversRconConfig) {
        if (args.length < 1) {
            message.channel.send('Usage: !playerlist <server>');
            return;
        }
        const serverName = args[0].toLowerCase();

        const config = serversRconConfig[serverName];
        if (!config) {
            message.channel.send(`Server "${serverName}" not found.`);
            return;
        }

        try {
            const result = await status(config.host, config.port, { timeout: 5000 });
            if (result.players.online === 0) {
                message.channel.send('No players are currently online.');
                return;
            }
            const playerNames = result.players.sample ? result.players.sample.map(p => p.name).join(', ') : 'Unknown';
            message.channel.send(`Online players (${result.players.online}/${result.players.max}): ${playerNames}`);
        } catch (error) {
            console.error('Error fetching player list:', error);
            message.channel.send('Failed to fetch player list. Is the server online?');
        }
    }
};
