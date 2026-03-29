const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const configStore = require('../configStore');

/**
 * Get logging configuration for a guild
 */
function getLogConfig(guildId) {
    const config = configStore.get('logConfig') || {};
    return config[guildId] || {};
}

/**
 * Set logging configuration for a guild
 */
function setLogConfig(guildId, config) {
    const allConfigs = configStore.get('logConfig') || {};
    allConfigs[guildId] = config;
    configStore.set('logConfig', allConfigs);
}

/**
 * Log message deletion
 */
async function logMessageDelete(message) {
    const config = getLogConfig(message.guild.id);
    if (!config.messageLog) return;

    const channel = message.guild.channels.cache.get(config.messageLog);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('📝 Message Deleted')
        .setDescription(`**Author:** ${message.author}\n**Channel:** ${message.channel}\n**Content:** ${message.content || '*[No content]*'}`)
        .addFields(
            { name: 'Message ID', value: message.id, inline: true },
            { name: 'Author ID', value: message.author.id, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `Author: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    if (message.attachments.size > 0) {
        embed.addFields({ 
            name: 'Attachments', 
            value: message.attachments.map(a => `[${a.name}](${a.url})`).join('\n') 
        });
    }

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error logging message delete:', error);
    }
}

/**
 * Log message edit
 */
async function logMessageEdit(oldMessage, newMessage) {
    if (oldMessage.content === newMessage.content) return; // No content change
    
    const config = getLogConfig(newMessage.guild.id);
    if (!config.messageLog) return;

    const channel = newMessage.guild.channels.cache.get(config.messageLog);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('📝 Message Edited')
        .setDescription(`**Author:** ${newMessage.author}\n**Channel:** ${newMessage.channel}\n[Jump to Message](${newMessage.url})`)
        .addFields(
            { name: 'Before', value: oldMessage.content?.substring(0, 1024) || '*[No content]*' },
            { name: 'After', value: newMessage.content?.substring(0, 1024) || '*[No content]*' }
        )
        .setTimestamp()
        .setFooter({ text: `Author: ${newMessage.author.tag}`, iconURL: newMessage.author.displayAvatarURL() });

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error logging message edit:', error);
    }
}

/**
 * Log member join
 */
async function logMemberJoin(member) {
    const config = getLogConfig(member.guild.id);
    if (!config.memberLog) return;

    const channel = member.guild.channels.cache.get(config.memberLog);
    if (!channel) return;

    const accountAge = Date.now() - member.user.createdTimestamp;
    const accountAgeDays = Math.floor(accountAge / (1000 * 60 * 60 * 24));

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📥 Member Joined')
        .setDescription(`${member} ${member.user.tag}`)
        .addFields(
            { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Account Age', value: `${accountAgeDays} days`, inline: true },
            { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `User ID: ${member.user.id}` });

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error logging member join:', error);
    }
}

/**
 * Log member leave
 */
async function logMemberLeave(member) {
    const config = getLogConfig(member.guild.id);
    if (!config.memberLog) return;

    const channel = member.guild.channels.cache.get(config.memberLog);
    if (!channel) return;

    const roles = member.roles.cache
        .filter(role => role.id !== member.guild.id)
        .map(role => role.name)
        .join(', ') || 'None';

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('📤 Member Left')
        .setDescription(`${member.user.tag}`)
        .addFields(
            { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
            { name: 'Member Count', value: `${member.guild.memberCount}`, inline: true },
            { name: 'Roles', value: roles.substring(0, 1024) }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `User ID: ${member.user.id}` });

    // Check audit log for kick/ban
    try {
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick
        });
        const kickLog = fetchedLogs.entries.first();

        if (kickLog && kickLog.target.id === member.id && Date.now() - kickLog.createdTimestamp < 5000) {
            embed.setColor('#FF6600');
            embed.setTitle('👢 Member Kicked');
            embed.addFields({ name: 'Kicked By', value: kickLog.executor.tag, inline: true });
            if (kickLog.reason) embed.addFields({ name: 'Reason', value: kickLog.reason });
        }
    } catch (error) {
        console.error('Error checking audit log:', error);
    }

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error logging member leave:', error);
    }
}

/**
 * Log member update (roles, nickname)
 */
async function logMemberUpdate(oldMember, newMember) {
    const config = getLogConfig(newMember.guild.id);
    if (!config.memberLog) return;

    const channel = newMember.guild.channels.cache.get(config.memberLog);
    if (!channel) return;

    // Check for role changes
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;
    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

    if (addedRoles.size > 0 || removedRoles.size > 0) {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🎭 Member Roles Updated')
            .setDescription(`${newMember}`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${newMember.user.id}` });

        if (addedRoles.size > 0) {
            embed.addFields({ name: '✅ Roles Added', value: addedRoles.map(r => r.name).join(', ') });
        }
        if (removedRoles.size > 0) {
            embed.addFields({ name: '❌ Roles Removed', value: removedRoles.map(r => r.name).join(', ') });
        }

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging role update:', error);
        }
    }

    // Check for nickname changes
    if (oldMember.nickname !== newMember.nickname) {
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('✏️ Nickname Changed')
            .setDescription(`${newMember}`)
            .addFields(
                { name: 'Before', value: oldMember.nickname || oldMember.user.username },
                { name: 'After', value: newMember.nickname || newMember.user.username }
            )
            .setTimestamp()
            .setFooter({ text: `User ID: ${newMember.user.id}` });

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging nickname change:', error);
        }
    }
}

/**
 * Log voice state changes
 */
async function logVoiceStateUpdate(oldState, newState) {
    const config = getLogConfig(newState.guild.id);
    if (!config.voiceLog) return;

    const channel = newState.guild.channels.cache.get(config.voiceLog);
    if (!channel) return;

    const member = newState.member;

    // Joined voice channel
    if (!oldState.channelId && newState.channelId) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔊 Joined Voice Channel')
            .setDescription(`${member} joined ${newState.channel}`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}` });

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging voice join:', error);
        }
    }
    // Left voice channel
    else if (oldState.channelId && !newState.channelId) {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🔇 Left Voice Channel')
            .setDescription(`${member} left ${oldState.channel}`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}` });

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging voice leave:', error);
        }
    }
    // Switched voice channels
    else if (oldState.channelId !== newState.channelId) {
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🔀 Switched Voice Channel')
            .setDescription(`${member} moved from ${oldState.channel} to ${newState.channel}`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}` });

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging voice switch:', error);
        }
    }
}

/**
 * Log channel updates
 */
async function logChannelUpdate(oldChannel, newChannel) {
    const config = getLogConfig(newChannel.guild.id);
    if (!config.serverLog) return;

    const channel = newChannel.guild.channels.cache.get(config.serverLog);
    if (!channel) return;

    const changes = [];

    if (oldChannel.name !== newChannel.name) {
        changes.push(`**Name:** ${oldChannel.name} → ${newChannel.name}`);
    }
    if (oldChannel.topic !== newChannel.topic) {
        changes.push(`**Topic:** ${oldChannel.topic || 'None'} → ${newChannel.topic || 'None'}`);
    }

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📢 Channel Updated')
        .setDescription(`${newChannel}\n\n${changes.join('\n')}`)
        .setTimestamp();

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error logging channel update:', error);
    }
}

/**
 * Log bans
 */
async function logBan(ban) {
    const config = getLogConfig(ban.guild.id);
    if (!config.modLog) return;

    const channel = ban.guild.channels.cache.get(config.modLog);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🔨 Member Banned')
        .setDescription(`${ban.user.tag}`)
        .addFields(
            { name: 'User ID', value: ban.user.id },
            { name: 'Reason', value: ban.reason || 'No reason provided' }
        )
        .setThumbnail(ban.user.displayAvatarURL())
        .setTimestamp();

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error logging ban:', error);
    }
}

/**
 * Log unbans
 */
async function logUnban(ban) {
    const config = getLogConfig(ban.guild.id);
    if (!config.modLog) return;

    const channel = ban.guild.channels.cache.get(config.modLog);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Member Unbanned')
        .setDescription(`${ban.user.tag}`)
        .addFields({ name: 'User ID', value: ban.user.id })
        .setThumbnail(ban.user.displayAvatarURL())
        .setTimestamp();

    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error logging unban:', error);
    }
}

module.exports = {
    getLogConfig,
    setLogConfig,
    logMessageDelete,
    logMessageEdit,
    logMemberJoin,
    logMemberLeave,
    logMemberUpdate,
    logVoiceStateUpdate,
    logChannelUpdate,
    logBan,
    logUnban
};
