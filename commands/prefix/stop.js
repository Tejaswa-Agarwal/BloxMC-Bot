const { RCON } = require('minecraft-server-util');
const serversRconConfig = require('../../config/serversRconConfig');

module.exports = {
    name: 'stop',
    description: 'Stop the Minecraft server',
    async execute(message, args) {
        if (args.length < 1) {
            message.channel.send('Usage: !stop <server>');
            return;
        }
        const serverName = args[0].toLowerCase();

        const rconConfig = serversRconConfig[serverName];
        if (!rconConfig) {
            message.channel.send(`Server "${serverName}" not found.`);
            return;
        }

        try {
            const rcon = new RCON(rconConfig.host, rconConfig.port, rconConfig.password, { timeout: 5000 });
            await rcon.connect();

            await rcon.send('stop');
            message.channel.send(`Server ${serverName} is stopping...`);

            rcon.close();
        } catch (error) {
            console.error('Error stopping server:', error);
            message.channel.send('Failed to stop server. Is the server online?');
        }
    }
};
