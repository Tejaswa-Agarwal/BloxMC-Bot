const { RCON } = require('minecraft-server-util');
const serversRconConfig = require('../../config/serversRconConfig');

module.exports = {
    name: 'whitelist',
    description: 'Manage the Minecraft server whitelist',
    async execute(message, args) {
        if (args.length < 3) {
            message.channel.send('Usage: !whitelist <server> <add|remove> <playername>');
            return;
        }
        const serverName = args[0].toLowerCase();
        const action = args[1];
        const playerName = args[2];

        const rconConfig = serversRconConfig[serverName];
        if (!rconConfig) {
            message.channel.send(`Server "${serverName}" not found.`);
            return;
        }

        try {
            const rcon = new RCON(rconConfig.host, rconConfig.port, rconConfig.password, { timeout: 5000 });
            await rcon.connect();

            if (action === 'add') {
                await rcon.send(`whitelist add ${playerName}`);
                message.channel.send(`Player ${playerName} added to whitelist on server ${serverName}.`);
            } else if (action === 'remove') {
                await rcon.send(`whitelist remove ${playerName}`);
                message.channel.send(`Player ${playerName} removed from whitelist on server ${serverName}.`);
            } else {
                message.channel.send('Invalid action. Use add or remove.');
            }

            rcon.close();
        } catch (error) {
            console.error('Error managing whitelist:', error);
            message.channel.send('Failed to manage whitelist. Is the server online?');
        }
    }
};
