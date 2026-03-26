const { EmbedBuilder } = require('discord.js');
const configStore = require('../configStore');

async function sendModLog(guild, action, moderator, target, reason, additional = {}) {
    const loggingChannelId = configStore.get('loggingChannelId');
    if (!loggingChannelId) return;

    try {
        const logChannel = await guild.channels.fetch(loggingChannelId);
        if (!logChannel || !logChannel.isTextBased()) return;

        const colors = {
            'ban': 0xE74C3C,
            'unban': 0x2ECC71,
            'kick': 0xE67E22,
            'timeout': 0xF39C12,
            'warn': 0xF39C12,
            'purge': 0x3498DB,
            'slowmode': 0x9B59B6,
            'lock': 0x95A5A6,
            'unlock': 0x2ECC71,
            'setnick': 0x1ABC9C
        };

        const emojis = {
            'ban': '🔨',
            'unban': '✅',
            'kick': '👢',
            'timeout': '⏰',
            'warn': '⚠️',
            'purge': '🗑️',
            'slowmode': '🐌',
            'lock': '🔒',
            'unlock': '🔓',
            'setnick': '✏️'
        };

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${emojis[action] || '📋'} Moderation Log - ${action.toUpperCase()}`, iconURL: moderator.displayAvatarURL() })
            .setColor(colors[action] || 0x5865F2)
            .addFields(
                { name: '👮 Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
                { name: '👤 Target', value: typeof target === 'string' ? target : `${target.tag} (${target.id})`, inline: true }
            )
            .setTimestamp();

        if (reason) {
            embed.addFields({ name: '📝 Reason', value: reason, inline: false });
        }

        // Add additional fields
        Object.entries(additional).forEach(([key, value]) => {
            embed.addFields({ name: key, value: String(value), inline: true });
        });

        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error sending mod log:', error);
    }
}

module.exports = { sendModLog };
