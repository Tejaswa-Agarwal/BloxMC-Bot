require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, Collection } = require('discord.js');
const messageCreateEvent = require('./events/messageCreate');
const { status, RCON } = require('minecraft-server-util');
const { REST, Routes } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel],
});

const logsCommand = require('./commands/slash/logs');
const configStore = require('./configStore');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const MINECRAFT_SERVER_HOST = process.env.MINECRAFT_SERVER_HOST || '172.96.140.162';
const MINECRAFT_SERVER_PORT = parseInt(process.env.MINECRAFT_SERVER_PORT) || 25565;

const serversRconConfig = {
    
    lifesteal: {
        host: '172.96.140.162',
        port: 25585,
        password: 'blox',
    },
    survival: {
        host: '104.194.8.43',
        port: 25590,
        password: 'blox',
    },
    // Add other servers here as needed
};

const serversStatusConfig = {
    lifesteal: {
        host: '172.96.140.162',
        port: 25565, // Minecraft server port for status query
    },
    survival: {
        host: '104.194.8.43',
        port: 25565, // Minecraft server port for status query
    },
    // Add other servers here as needed
};

const liveStatusIntervalRef = { current: null };

const DISCORD_GUILD_ID = '1190963399773921290'; // Restrict commands to this guild ID
const ALLOWED_ROLE_IDS = (process.env.ALLOWED_ROLE_IDS || '').split(',').map(r => r.trim()).filter(r => r.length > 0);
const BAN_UNBAN_KICK_ROLE_ID = '1368108575725064192'; // New role ID for ban, unban, kick commands

client.prefixCommands = new Collection();
client.slashCommands = new Collection();

const commandStatusFile = path.join(__dirname, 'data', 'commandStatus.json');
let commandStatus = {};

let loggingChannelId = configStore.get('loggingChannelId') || null;
let liveStatusChannelId = configStore.get('liveStatusChannelId') || null;

// Load command status from file
function loadCommandStatus() {
    if (fs.existsSync(commandStatusFile)) {
        const rawData = fs.readFileSync(commandStatusFile);
        commandStatus = JSON.parse(rawData);
    } else {
        commandStatus = {};
    }
}

loadCommandStatus();

const prefixCommandsPath = path.join(__dirname, 'commands', 'prefix');
const slashCommandsPath = path.join(__dirname, 'commands', 'slash');

// Load prefix commands
fs.readdirSync(prefixCommandsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(path.join(prefixCommandsPath, file));
        client.prefixCommands.set(command.name, command);
    }
});

// Load slash commands
const slashCommands = [];
fs.readdirSync(slashCommandsPath).forEach(file => {
    if (file.endsWith('.js') && file !== 'serverinfo.js') {
        const command = require(path.join(slashCommandsPath, file));
        client.slashCommands.set(command.data.name, command);
        slashCommands.push(command.data);
    }
});

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function registerCommands() {
    try {
        if (!DISCORD_GUILD_ID) {
            console.log('DISCORD_GUILD_ID not set. Skipping guild command registration.');
            return;
        }
        // Register new commands
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, DISCORD_GUILD_ID),
            { body: slashCommands.map(cmd => cmd.toJSON ? cmd.toJSON() : cmd) },
        );
        console.log('Successfully registered slash commands.');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
}

// Periodically re-register slash commands every 5 minutes to prevent disappearance
setInterval(() => {
    if (client.isReady()) {
        console.log('Re-registering slash commands to prevent disappearance...');
        registerCommands();
    }
}, 5 * 60 * 1000); // 5 minutes interval

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await registerCommands();
    // Register messageCreate event for automod
    messageCreateEvent(client);
});

function createStatusEmbed(result) {
    const embed = new EmbedBuilder()
        .setTitle('Minecraft Server Status')
        .setColor(0x00FF00)
        .addFields(
            { name: 'Version', value: result.version.name, inline: true },
            { name: 'Players', value: `${result.players.online}/${result.players.max}`, inline: true },
            { name: 'MOTD', value: result.motd.clean, inline: false }
        );
    return embed;
}

function createLogEmbedForPrefixCommand(message, command, args) {
    const embed = new EmbedBuilder()
        .setTitle('Command Usage Log (Prefix Command)')
        .setColor(0x0099FF)
        .addFields(
            { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
            { name: 'Command', value: command.name, inline: true },
            { name: 'Arguments', value: args.length > 0 ? args.join(' ') : 'None', inline: false },
            { name: 'Guild', value: message.guild ? `${message.guild.name} (${message.guild.id})` : 'DM', inline: true },
            { name: 'Channel', value: message.channel ? `${message.channel.name} (${message.channel.id})` : 'DM', inline: true },
            { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        );
    return embed;
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    // Restrict prefix commands 'livestatus', 'mccommand', 'giveaway', and new commands to the specified guild and roles
    const restrictedCommands = ['livestatus', 'mccommand', 'giveaway', 'whitelist', 'ban', 'unban', 'kick', 'broadcast', 'playerlist', 'restart', 'stop'];
    if (restrictedCommands.includes(commandName)) {
        if (message.guild?.id !== DISCORD_GUILD_ID) {
            // Allow only specific user in other servers
            if (message.author.id !== '1124168034332975204') {
                return;
            }
        } else {
            const memberRoles = message.member.roles.cache;
            if (['ban', 'unban', 'kick'].includes(commandName)) {
                if (BAN_UNBAN_KICK_ROLE_ID && !memberRoles.has(BAN_UNBAN_KICK_ROLE_ID)) {
                    message.channel.send('You do not have permission to use this command.');
                    return;
                }
            } else {
                if (ALLOWED_ROLE_IDS.length > 0 && !ALLOWED_ROLE_IDS.some(roleId => memberRoles.has(roleId))) {
                    message.channel.send('You do not have permission to use this command.');
                    return;
                }
            }
        }
    }

    try {
        if (command.name === 'livestatus') {
            await command.execute(message, args, { host: MINECRAFT_SERVER_HOST, port: MINECRAFT_SERVER_PORT }, liveStatusIntervalRef);
        } else if (command.name === 'mccommand') {
            await command.execute(message, args, serversRconConfig);
        } else if (['whitelist', 'ban', 'unban', 'kick', 'broadcast', 'restart', 'stop'].includes(command.name)) {
            await command.execute(message, args, serversRconConfig);
        } else if (['playerlist', 'serverinfo'].includes(command.name)) {
            await command.execute(message, args, { host: MINECRAFT_SERVER_HOST, port: MINECRAFT_SERVER_PORT });
        } else {
            await command.execute(message, args, { host: MINECRAFT_SERVER_HOST, port: MINECRAFT_SERVER_PORT });
        }
        // Send command usage log if logging channel is set
        const logChannelId = loggingChannelId || logsCommand.getLoggingChannelId();
        if (logChannelId) {
            const logChannel = message.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const embed = createLogEmbedForPrefixCommand(message, command, args);
                logChannel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error(`Error executing prefix command ${commandName}:`, error);
        message.channel.send('An error occurred while executing the command.');
    }
});

function createLogEmbedForSlashCommand(interaction, command) {
    const options = interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join('\n') || 'None';

    const embed = new EmbedBuilder()
        .setTitle('Command Usage Log (Slash Command)')
        .setColor(0x0099FF)
        .addFields(
            { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: 'Command', value: command.data.name, inline: true },
            { name: 'Options', value: options, inline: false },
            { name: 'Guild', value: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'DM', inline: true },
            { name: 'Channel', value: interaction.channel ? `${interaction.channel.name} (${interaction.channel.id})` : 'DM', inline: true },
            { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        );
    return embed;
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    // Restrict slash commands 'livestatus', 'mccommand', 'giveaway', and new commands to the specified guild and roles
    const restrictedCommands = ['livestatus', 'mccommand', 'giveaway', 'whitelist', 'ban', 'unban', 'kick', 'broadcast', 'playerlist', 'restart', 'stop'];
    if (restrictedCommands.includes(interaction.commandName)) {
        if (interaction.guildId !== DISCORD_GUILD_ID) {
            // Allow only specific user in other servers
            if (interaction.user.id !== '1124168034332975204') {
                return;
            }
        } else {
            const memberRoles = interaction.member.roles;
            if (['ban', 'unban', 'kick'].includes(interaction.commandName)) {
                if (BAN_UNBAN_KICK_ROLE_ID && !memberRoles.cache.has(BAN_UNBAN_KICK_ROLE_ID)) {
                    await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                    return;
                }
            } else {
                if (ALLOWED_ROLE_IDS.length > 0 && !ALLOWED_ROLE_IDS.some(roleId => memberRoles.cache.has(roleId))) {
                    await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                    return;
                }
            }
        }
    }

    try {
        await interaction.deferReply();
        if (command.data.name === 'livestatus') {
            await command.execute(interaction, { host: MINECRAFT_SERVER_HOST, port: MINECRAFT_SERVER_PORT }, liveStatusIntervalRef);
        } else if (command.data.name === 'mccommand') {
            await command.execute(interaction, serversRconConfig);
        } else if (['whitelist', 'ban', 'unban', 'kick', 'broadcast', 'restart', 'stop'].includes(command.data.name)) {
            let serverName = interaction.options.getString('server');
            if (serverName) {
                serverName = serverName.toLowerCase();
            }
            console.log(`Executing slash command ${command.data.name} on server: ${serverName}`);
            await command.execute(interaction, serversRconConfig, serverName);
        } else if (['playerlist', 'serverinfo'].includes(command.data.name)) {
            await command.execute(interaction, serversStatusConfig);
        } else {
            await command.execute(interaction, { host: MINECRAFT_SERVER_HOST, port: MINECRAFT_SERVER_PORT });
        }
        // Send command usage log if logging channel is set
        const logChannelId = loggingChannelId || logsCommand.getLoggingChannelId();
        if (logChannelId && interaction.guild) {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const embed = createLogEmbedForSlashCommand(interaction, command);
                logChannel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error(`Error executing slash command ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
        } else if (interaction.deferred) {
            await interaction.editReply({ content: 'An error occurred while processing the command.' });
        }
    }
});

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    if (input.trim().toLowerCase() === 'stop') {
        console.log('Stopping bot...');
        process.exit(0);
    }
});

client.login(DISCORD_TOKEN);
