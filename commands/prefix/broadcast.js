const { RCON } = require('minecraft-server-util');
const serversRconConfig = require('../../config/serversRconConfig');

module.exports = {
    name: 'broadcast',
    description: 'Broadcast a message to all players on the Minecraft server',
    async execute(message, args) {
        if (args.length < 2) {
            message.channel.send('Usage: !broadcast <server> <message>');
            return;
        }
        const serverName = args[0].toLowerCase();
        const broadcastMessage = args.slice(1).join(' ');

        const rconConfig = serversRconConfig[serverName];
        if (!rconConfig) {
            message.channel.send(`Server "${serverName}" not found.`);
            return;
        }

        try {
            const rcon = new RCON(rconConfig.host, rconConfig.port, rconConfig.password, { timeout: 5000 });
            await rcon.connect();

            await rcon.send(`broadcast ${broadcastMessage}`);
            message.channel.send(`Broadcast message sent on server ${serverName}.`);

            rcon.close();
        } catch (error) {
            console.error('Error sending broadcast:', error);
            message.channel.send('Failed to send broadcast. Is the server online?');
        }
    }
};
