require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const messageCreateEvent = require('./events/messageCreate');
const { REST, Routes } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Channel],
});

const configStore = require('./configStore');
const { hasModeratorPermission, hasAdminPermission } = require('./utils/permissions');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const ALLOWED_ROLE_IDS = (process.env.ALLOWED_ROLE_IDS || '').split(',').map(r => r.trim()).filter(r => r.length > 0);
const MODERATOR_ROLE_IDS = (process.env.MODERATOR_ROLE_IDS || '').split(',').map(r => r.trim()).filter(r => r.length > 0);
const ADMIN_ROLE_IDS = (process.env.ADMIN_ROLE_IDS || '').split(',').map(r => r.trim()).filter(r => r.length > 0);

client.prefixCommands = new Collection();
client.slashCommands = new Collection();

const commandStatusFile = path.join(__dirname, 'data', 'commandStatus.json');
let commandStatus = {};

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
    if (file.endsWith('.js')) {
        const command = require(path.join(slashCommandsPath, file));
        client.slashCommands.set(command.data.name, command);
        slashCommands.push(command.data);
    }
});

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function registerCommands() {
    try {
        // Register commands globally
        await rest.put(
            Routes.applicationCommands(client.user.id),
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


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = 'k!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    // Check permissions based on command category
    const moderationCommands = ['ban', 'unban', 'kick', 'timeout', 'purge', 'purgeuser', 'slowmode', 'lock', 'unlock', 'warn', 'warnings', 'setnick', 'removecase', 'removewarn'];
    const adminCommands = ['announce', 'command', 'say', 'clearwarns'];
    
    // Moderation commands require moderator or admin role
    if (moderationCommands.includes(commandName)) {
        if (!hasModeratorPermission(message.member, message.guild.id, message.author.id, message.guild.ownerId)) {
            message.channel.send('❌ You do not have permission to use this command. Only moderators, admins, server owner, and bot owner can use moderation commands.');
            return;
        }
    }
    
    // Admin commands require admin role
    if (adminCommands.includes(commandName)) {
        if (!hasAdminPermission(message.member, message.guild.id, message.author.id, message.guild.ownerId)) {
            message.channel.send('❌ You do not have permission to use this command. Only admins, server owner, and bot owner can use admin commands.');
            return;
        }
    }

    // Giveaway commands require allowed roles (keeping backward compatibility)
    if (commandName === 'giveaway') {
        const memberRoles = message.member?.roles.cache;
        if (ALLOWED_ROLE_IDS.length > 0 && !ALLOWED_ROLE_IDS.some(roleId => memberRoles?.has(roleId))) {
            if (!hasAdminPermission(message.member, message.guild.id, message.author.id, message.guild.ownerId)) {
                message.channel.send('❌ You do not have permission to use this command.');
                return;
            }
        }
    }

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Error executing prefix command ${commandName}:`, error);
        message.channel.send('An error occurred while executing the command.');
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    // Check permissions based on command category
    const moderationCommands = ['ban', 'unban', 'kick', 'timeout', 'purge', 'purgeuser', 'slowmode', 'lock', 'unlock', 'warn', 'warnings', 'setnick', 'removecase', 'removewarn'];
    const adminCommands = ['announce', 'command', 'logs', 'say', 'clearwarns'];
    
    // Moderation commands require moderator or admin role
    if (moderationCommands.includes(interaction.commandName)) {
        if (!hasModeratorPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command. Only moderators, admins, server owner, and bot owner can use moderation commands.', ephemeral: true });
            return;
        }
    }
    
    // Admin commands require admin role
    if (adminCommands.includes(interaction.commandName)) {
        if (!hasAdminPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
            await interaction.reply({ content: '❌ You do not have permission to use this command. Only admins, server owner, and bot owner can use admin commands.', ephemeral: true });
            return;
        }
    }

    // Giveaway commands require allowed roles (keeping backward compatibility)
    if (interaction.commandName === 'giveaway' || interaction.commandName === 'giveaway-reroll') {
        const memberRoles = interaction.member?.roles;
        if (ALLOWED_ROLE_IDS.length > 0 && !ALLOWED_ROLE_IDS.some(roleId => memberRoles?.cache.has(roleId))) {
            if (!hasAdminPermission(interaction.member, interaction.guild.id, interaction.user.id, interaction.guild.ownerId)) {
                await interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
                return;
            }
        }
    }

    try {
        await interaction.deferReply();
        await command.execute(interaction);
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
