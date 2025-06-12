const net = require('net');

function sendRconCommand({ host, port, password }, command) {
    return new Promise((resolve, reject) => {
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
    name: 'mccommand',
    description: 'Send a command to the Minecraft server console',
    execute: async (message, args, serversRconConfig) => {
        if (args.length < 2) {
            message.channel.send('Please provide a server name and a command to send to the Minecraft server.');
            return;
        }

        const serverName = args.shift().toLowerCase();
        const commandToSend = args.join(' ');

        const config = serversRconConfig[serverName];
        if (!config) {
            message.channel.send(`RCON configuration for server "${serverName}" not found.`);
            return;
        }

        if (!config.host || !config.port || !config.password) {
            message.channel.send('RCON configuration is incomplete. Please check host, port, and password.');
            return;
        }

        try {
            const response = await sendRconCommand(config, commandToSend);
            message.channel.send(`Command response:\n${response}`);
        } catch (error) {
            message.channel.send(`Failed to send command to the Minecraft server: ${error.message}`);
        }
    }
};
