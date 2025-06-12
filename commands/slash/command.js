const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

const fs = require('fs');
const path = require('path');

const commandStatusFile = path.join(__dirname, '..', '..', 'data', 'commandStatus.json');
let commandStatus = {};

// Load command status from file
function loadCommandStatus() {
    if (fs.existsSync(commandStatusFile)) {
        const rawData = fs.readFileSync(commandStatusFile);
        commandStatus = JSON.parse(rawData);
    } else {
        commandStatus = {};
    }
}

// Save command status to file
function saveCommandStatus() {
    fs.writeFileSync(commandStatusFile, JSON.stringify(commandStatus, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command')
        .setDescription('Enable or disable bot commands')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Enable or disable a command')
                .setRequired(true)
                .addChoices(
                    { name: 'enable', value: 'enable' },
                    { name: 'disable', value: 'disable' }
                ))
        .addStringOption(option =>
            option.setName('commandname')
                .setDescription('The command to enable or disable')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            if (interaction.replied || interaction.deferred) {
                return;
            }
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const action = interaction.options.getString('action');
        const cmdName = interaction.options.getString('commandname').toLowerCase();

        loadCommandStatus();

        if (!['enable', 'disable'].includes(action)) {
            if (interaction.replied || interaction.deferred) {
                return;
            }
            return interaction.reply({ content: 'Action must be "enable" or "disable".', ephemeral: true });
        }

        commandStatus[cmdName] = (action === 'enable');

        saveCommandStatus();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: `Command "${cmdName}" has been ${action}d.`, ephemeral: true });
        } else {
            await interaction.reply({ content: `Command "${cmdName}" has been ${action}d.`, ephemeral: true });
        }
    }
};
