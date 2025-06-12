const { SlashCommandBuilder } = require('discord.js');

function sendRconCommand({ host, port, password }, command) {
    return new Promise((resolve, reject) => {
        const net = require('net');
        const socket = new net.Socket();
        let authenticated = false;
        let responseData = '';

        socket.connect(port, host, () => {
            const loginPacket = createPacket(3, 0, password);
            socket.write(loginPacket);
        });

        socket.on('data', (data) => {
            responseData += data.toString();

            if (!authenticated) {
                if (data.readInt32LE(4) === -1) {
                    socket.destroy();
                    reject(new Error('Authentication failed'));
                } else {
                    authenticated = true;
                    const commandPacket = createPacket(2, 0, command);
                    socket.write(commandPacket);
                }
            } else {
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
            return data.slice(12, data.length - 2).toString('utf8');
        }
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the Minecraft server')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Select the server')
                .setRequired(true)
                .addChoices(
                    { name: 'lifesteal', value: 'lifesteal' },
                    { name: 'survival', value: 'survival' }
                )),
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

        try {
            const command = 'stop';
            const response = await sendRconCommand(rconConfig, command);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: `Command response:\n${response}` });
            } else {
                await interaction.reply({ content: `Command response:\n${response}` });
            }
        } catch (error) {
            console.error('Error stopping server:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: 'Failed to stop server. Is the server online?', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to stop server. Is the server online?', ephemeral: true });
            }
        }
    }
};
