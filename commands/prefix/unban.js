const { RCON } = require('minecraft-server-util');
const serversRconConfig = require('../../config/serversRconConfig');

module.exports = {
    name: 'unban',
    description: 'Unban a player from the Minecraft server',
    async execute(message, args) {
        if (args.length < 2) {
            message.channel.send('Usage: !unban <server> <playername>');
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

            await rcon.send(`pardon ${playerName}`);
            message.channel.send(`Player ${playerName} has been unbanned on server ${serverName}.`);

            rcon.close();
        } catch (error) {
            console.error('Error unbanning player:', error);
            message.channel.send('Failed to unban player. Is the server online?');
        }
    }
};
