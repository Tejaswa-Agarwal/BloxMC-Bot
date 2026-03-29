const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'config.json');

function getConfig() {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
}

function getWelcomerConfig(guildId) {
    const config = getConfig();
    return config[guildId]?.welcomerConfig || null;
}

function replacePlaceholders(text, member) {
    return text
        .replace(/{user}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{usertag}/g, member.user.tag)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount.toString());
}

async function sendWelcomeMessage(member) {
    const config = getWelcomerConfig(member.guild.id);
    if (!config || !config.enabled) return;

    const channel = await member.guild.channels.fetch(config.channelId).catch(() => null);
    if (!channel) return;

    const message = replacePlaceholders(config.message || 'Welcome {user} to {server}!', member);
    const embedEnabled = config.embedEnabled !== false;

    try {
        if (embedEnabled) {
            const embed = new EmbedBuilder()
                .setTitle(config.embedTitle || '👋 Welcome!')
                .setDescription(message)
                .setColor(config.embedColor || '#00FF00')
                .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                .setFooter({ text: `Member #${member.guild.memberCount}` })
                .setTimestamp();

            if (config.embedImage) {
                embed.setImage(config.embedImage);
            }

            await channel.send({ embeds: [embed] });
        } else {
            await channel.send(message);
        }

        // Auto-role assignment
        if (config.autoRoleId) {
            const role = member.guild.roles.cache.get(config.autoRoleId);
            if (role && member.guild.members.me.permissions.has('ManageRoles')) {
                await member.roles.add(role).catch(() => {});
            }
        }
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
}

async function sendGoodbyeMessage(member) {
    const config = getWelcomerConfig(member.guild.id);
    if (!config || !config.goodbyeEnabled) return;

    const channelId = config.goodbyeChannelId || config.channelId;
    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    const message = replacePlaceholders(
        config.goodbyeMessage || '{username} has left {server}. Goodbye!',
        member
    );

    try {
        if (config.goodbyeEmbedEnabled) {
            const embed = new EmbedBuilder()
                .setTitle('👋 Goodbye')
                .setDescription(message)
                .setColor('#FF0000')
                .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                .setFooter({ text: `${member.guild.memberCount} members remaining` })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } else {
            await channel.send(message);
        }
    } catch (error) {
        console.error('Error sending goodbye message:', error);
    }
}

module.exports = {
    sendWelcomeMessage,
    sendGoodbyeMessage,
    getWelcomerConfig,
    replacePlaceholders
};
