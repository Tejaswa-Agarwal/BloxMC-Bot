const { SlashCommandBuilder } = require('discord.js');

function sendRconCommand({ host, port, password }, command) {
    return new Promise((resolve, reject) => {
        const net = require('net');
        const socket = new net.Socket();
        let authenticated = false;
        let responseData = '';

        socket.connect(port, host, () => {
            // Send RCON login packet
            const loginPacket = createPacket(3, 0, password);
            socket.write(loginPacket);
        });

        socket.on('data', (data) => {
            responseData += data.toString();

            if (!authenticated) {
                // Check if login was successful
                if (data.readInt32LE(4) === -1) {
                    socket.destroy();
                    reject(new Error('Authentication failed'));
                } else {
                    authenticated = true;
                    // Send command packet
                    const commandPacket = createPacket(2, 0, command);
                    socket.write(commandPacket);
                }
            } else {
                // Received command response
                const response = parseResponse(data);
                socket.end();
                resolve(response);
            }
        });

        socket.on('error', (err) => {
            reject(err);
        });

        socket.on('close', () => {
            if (!authenticated) {
                reject(new Error('Connection closed before authentication'));
            }
        });

        function createPacket(type, id, body) {
            const bodyBuffer = Buffer.from(body, 'utf8');
            const length = 4 + 4 + bodyBuffer.length + 2;
            const buffer = Buffer.alloc(4 + length);
            buffer.writeInt32LE(length, 0);
            buffer.writeInt32LE(id, 4);
            buffer.writeInt32LE(type, 8);
            bodyBuffer.copy(buffer, 12);
            buffer.writeInt16LE(0, 12 + bodyBuffer.length);
            return buffer;
        }

        function parseResponse(data) {
            // Skip length (4 bytes), id (4 bytes), type (4 bytes)
            return data.slice(12, data.length - 2).toString('utf8');
        }
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Manage the Minecraft server whitelist')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Select the server')
                .setRequired(true)
                .addChoices(
                    { name: 'lifesteal', value: 'lifesteal' },
                    { name: 'survival', value: 'survival' }
                ))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Add or remove a player')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 'add' },
                    { name: 'remove', value: 'remove' }
                ))
        .addStringOption(option =>
            option.setName('player')
                .setDescription('Player name')
                .setRequired(true)),
    async execute(interaction, serversRconConfig, serverName) {
        if (!serverName) {
            serverName = interaction.options.getString('server').toLowerCase();
        }

        const rconConfig = serversRconConfig[serverName];
        if (!rconConfig) {
            await interaction.reply({ content: `Server "${serverName}" not found.`, ephemeral: true });
            return;
        }

        if (!rconConfig.host || !rconConfig.port || !rconConfig.password) {
            await interaction.reply({ content: 'RCON configuration is incomplete. Please check host, port, and password.', ephemeral: true });
            return;
        }

        const action = interaction.options.getString('action');
        const playerName = interaction.options.getString('player');

        try {
            let command;
            if (action === 'add') {
                command = `whitelist add ${playerName}`;
            } else if (action === 'remove') {
                command = `whitelist remove ${playerName}`;
            } else {
                await interaction.reply({ content: 'Invalid action. Use add or remove.', ephemeral: true });
                return;
            }

            const response = await sendRconCommand(rconConfig, command);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: `Command response:\n${response}` });
            } else {
                await interaction.reply({ content: `Command response:\n${response}` });
            }
        } catch (error) {
            console.error('Error managing whitelist:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: 'Failed to manage whitelist. Is the server online?', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to manage whitelist. Is the server online?', ephemeral: true });
            }
        }
    }
};
