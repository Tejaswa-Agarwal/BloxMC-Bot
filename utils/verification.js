const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'config.json');

function getConfig() {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getVerifyConfig(guildId) {
    const config = getConfig();
    return config[guildId]?.verifyConfig || null;
}

function setVerifyConfig(guildId, verifyConfig) {
    const config = getConfig();
    if (!config[guildId]) config[guildId] = {};
    config[guildId].verifyConfig = verifyConfig;
    saveConfig(config);
}

async function sendVerifyPanel(channel, title, description) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('verify_member')
            .setLabel('Verify')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success),
    );

    const message = await channel.send({
        embeds: [{
            title: title || 'Server Verification',
            description: description || 'Click **Verify** to get access to the server.',
            color: 0x57F287,
        }],
        components: [row],
    });

    return message;
}

async function handleVerifyButton(interaction) {
    if (!interaction.guild) {
        await interaction.reply({ content: '❌ This can only be used in a server.', ephemeral: true });
        return;
    }

    const verifyConfig = getVerifyConfig(interaction.guild.id);
    if (!verifyConfig?.enabled || !verifyConfig.roleId) {
        await interaction.reply({ content: '❌ Verification is not configured.', ephemeral: true });
        return;
    }

    const role = interaction.guild.roles.cache.get(verifyConfig.roleId);
    if (!role) {
        await interaction.reply({ content: '❌ Verification role no longer exists.', ephemeral: true });
        return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (member.roles.cache.has(role.id)) {
        await interaction.reply({ content: '✅ You are already verified.', ephemeral: true });
        return;
    }

    await member.roles.add(role);
    await interaction.reply({ content: `✅ Verified! You received ${role}.`, ephemeral: true });
}

module.exports = {
    getVerifyConfig,
    setVerifyConfig,
    sendVerifyPanel,
    handleVerifyButton,
};

