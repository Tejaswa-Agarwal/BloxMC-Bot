const configStore = require('../configStore');

/**
 * Get automod configuration for a guild
 */
function getAutomodConfig(guildId) {
    const config = configStore.get('automodConfig') || {};
    return config[guildId] || {
        enabled: false,
        antiSpam: { enabled: false, maxMessages: 5, timeWindow: 5000 },
        antiInvite: { enabled: false, whitelist: [] },
        antiCaps: { enabled: false, threshold: 70, minLength: 10 },
        antiMassMention: { enabled: false, max: 5 },
        antiEmoji: { enabled: false, max: 10 },
        customWords: [],
        whitelistedChannels: [],
        whitelistedRoles: [],
        punishment: 'warn' // warn, timeout, kick, ban
    };
}

/**
 * Set automod configuration for a guild
 */
function setAutomodConfig(guildId, config) {
    const allConfigs = configStore.get('automodConfig') || {};
    allConfigs[guildId] = config;
    configStore.set('automodConfig', allConfigs);
}

// Store recent messages for spam detection
const messageCache = new Map();

/**
 * Check if user should be exempt from automod
 */
function isExempt(member, config) {
    // Check if user has whitelisted role
    if (config.whitelistedRoles && config.whitelistedRoles.some(roleId => member.roles.cache.has(roleId))) {
        return true;
    }
    
    // Check if user has moderator permissions
    if (member.permissions.has('ManageMessages') || member.permissions.has('Administrator')) {
        return true;
    }
    
    return false;
}

/**
 * Check if channel is whitelisted
 */
function isChannelWhitelisted(channelId, config) {
    return config.whitelistedChannels && config.whitelistedChannels.includes(channelId);
}

/**
 * Check for spam
 */
function checkSpam(message, config) {
    if (!config.antiSpam || !config.antiSpam.enabled) return null;
    
    const userId = message.author.id;
    const guildId = message.guild.id;
    const key = `${guildId}-${userId}`;
    
    if (!messageCache.has(key)) {
        messageCache.set(key, []);
    }
    
    const userMessages = messageCache.get(key);
    const now = Date.now();
    
    // Remove old messages
    const recentMessages = userMessages.filter(msg => now - msg.timestamp < config.antiSpam.timeWindow);
    recentMessages.push({ timestamp: now, content: message.content });
    messageCache.set(key, recentMessages);
    
    // Check for duplicate messages
    const duplicates = recentMessages.filter(msg => msg.content === message.content);
    
    if (recentMessages.length > config.antiSpam.maxMessages || duplicates.length >= 3) {
        // Clear cache for this user
        messageCache.set(key, []);
        return 'Spam detected';
    }
    
    return null;
}

/**
 * Check for invite links
 */
function checkInvites(message, config) {
    if (!config.antiInvite || !config.antiInvite.enabled) return null;
    
    const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/gi;
    const matches = message.content.match(inviteRegex);
    
    if (matches) {
        // Check if any matched invites are whitelisted
        const whitelist = config.antiInvite.whitelist || [];
        const isWhitelisted = matches.some(invite => 
            whitelist.some(allowed => invite.toLowerCase().includes(allowed.toLowerCase()))
        );
        
        if (!isWhitelisted) {
            return 'Discord invite link detected';
        }
    }
    
    return null;
}

/**
 * Check for excessive caps
 */
function checkCaps(message, config) {
    if (!config.antiCaps || !config.antiCaps.enabled) return null;
    
    const content = message.content;
    
    if (content.length < config.antiCaps.minLength) return null;
    
    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const totalLetters = (content.match(/[a-zA-Z]/g) || []).length;
    
    if (totalLetters === 0) return null;
    
    const capsPercentage = (capsCount / totalLetters) * 100;
    
    if (capsPercentage > config.antiCaps.threshold) {
        return `Excessive caps (${Math.round(capsPercentage)}%)`;
    }
    
    return null;
}

/**
 * Check for mass mentions
 */
function checkMassMention(message, config) {
    if (!config.antiMassMention || !config.antiMassMention.enabled) return null;
    
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    
    if (mentionCount > config.antiMassMention.max) {
        return `Mass mention detected (${mentionCount} mentions)`;
    }
    
    return null;
}

/**
 * Check for emoji spam
 */
function checkEmojiSpam(message, config) {
    if (!config.antiEmoji || !config.antiEmoji.enabled) return null;
    
    // Count custom emojis
    const customEmojiRegex = /<a?:\w+:\d+>/g;
    const customEmojis = (message.content.match(customEmojiRegex) || []).length;
    
    // Count unicode emojis (basic detection)
    const unicodeEmojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
    const unicodeEmojis = (message.content.match(unicodeEmojiRegex) || []).length;
    
    const totalEmojis = customEmojis + unicodeEmojis;
    
    if (totalEmojis > config.antiEmoji.max) {
        return `Emoji spam detected (${totalEmojis} emojis)`;
    }
    
    return null;
}

/**
 * Check for custom filtered words
 */
function checkCustomWords(message, config) {
    if (!config.customWords || config.customWords.length === 0) return null;
    
    const content = message.content.toLowerCase();
    
    for (const word of config.customWords) {
        if (content.includes(word.toLowerCase())) {
            return `Filtered word detected: ${word}`;
        }
    }
    
    return null;
}

/**
 * Apply punishment for automod violation
 */
async function applyPunishment(message, reason, config) {
    const member = message.member;
    const punishment = config.punishment || 'warn';
    
    try {
        // Delete the message
        await message.delete().catch(() => {});
        
        // Apply punishment
        switch (punishment) {
            case 'warn':
                await message.channel.send({
                    content: `⚠️ ${message.author}, your message was removed. Reason: ${reason}`,
                }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
                break;
                
            case 'timeout':
                await member.timeout(5 * 60 * 1000, `Automod: ${reason}`);
                await message.channel.send({
                    content: `🔇 ${message.author} has been timed out for 5 minutes. Reason: ${reason}`,
                }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
                break;
                
            case 'kick':
                await member.kick(`Automod: ${reason}`);
                await message.channel.send({
                    content: `👢 ${message.author.tag} has been kicked. Reason: ${reason}`,
                });
                break;
                
            case 'ban':
                await member.ban({ reason: `Automod: ${reason}` });
                await message.channel.send({
                    content: `🔨 ${message.author.tag} has been banned. Reason: ${reason}`,
                });
                break;
        }
        
        // Log to mod log if configured
        const logger = require('./logger');
        const logConfig = logger.getLogConfig(message.guild.id);
        
        if (logConfig.modLog) {
            const { EmbedBuilder } = require('discord.js');
            const logChannel = message.guild.channels.cache.get(logConfig.modLog);
            
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#FF6600')
                    .setTitle('🤖 Automod Action')
                    .setDescription(`**User:** ${message.author}\n**Channel:** ${message.channel}\n**Reason:** ${reason}\n**Action:** ${punishment}`)
                    .addFields({ name: 'Message Content', value: message.content.substring(0, 1024) || '*[No content]*' })
                    .setTimestamp();
                
                await logChannel.send({ embeds: [embed] });
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error applying automod punishment:', error);
        return false;
    }
}

/**
 * Main automod check function
 */
async function checkMessage(message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    const config = getAutomodConfig(message.guild.id);
    
    if (!config.enabled) return;
    
    // Check if user/channel is exempt
    if (isExempt(message.member, config)) return;
    if (isChannelWhitelisted(message.channel.id, config)) return;
    
    // Run checks
    const checks = [
        checkSpam(message, config),
        checkInvites(message, config),
        checkCaps(message, config),
        checkMassMention(message, config),
        checkEmojiSpam(message, config),
        checkCustomWords(message, config)
    ];
    
    for (const result of checks) {
        if (result) {
            await applyPunishment(message, result, config);
            return true;
        }
    }
    
    return false;
}

// Clean up message cache periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, messages] of messageCache.entries()) {
        const recentMessages = messages.filter(msg => now - msg.timestamp < 10000);
        if (recentMessages.length === 0) {
            messageCache.delete(key);
        } else {
            messageCache.set(key, recentMessages);
        }
    }
}, 60000); // Clean every minute

module.exports = {
    getAutomodConfig,
    setAutomodConfig,
    checkMessage
};
