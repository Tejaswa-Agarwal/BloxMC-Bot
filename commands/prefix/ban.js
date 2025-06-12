const { RCON } = require('minecraft-server-util');
const serversRconConfig = require('../../config/serversRconConfig');

module.exports = {
    name: 'ban',
    description: 'Ban a player from the Minecraft server',
    async execute(message, args) {
        if (args.length < 2) {
            message.channel.send('Usage: !ban <server> <playername>');
            return;
        }
        const serverName = args[0].toLowerCase();
        const playerName = args[1];

        const rconConfig = serversRconConfig[serverName];
        if (!rconConfig) {
            message.channel.send(`Server "${serverName}" not found.`);
            return;
        }

        try {
            const rcon = new RCON(rconConfig.host, rconConfig.port, rconConfig.password, { timeout: 5000 });
            await rcon.connect();

            await rcon.send(`ban ${playerName}`);
            message.channel.send(`Player ${playerName} has been banned on server ${serverName}.`);

            rcon.close();
        } catch (error) {
            console.error('Error banning player:', error);
            message.channel.send('Failed to ban player. Is the server online?');
        }
    }
};
