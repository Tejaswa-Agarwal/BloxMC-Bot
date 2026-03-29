const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const configStore = require('../configStore');

/**
 * Get reaction role configuration for a guild
 */
function getReactionRoleConfig(guildId) {
    const config = configStore.get('reactionRoleConfig') || {};
    return config[guildId] || {};
}

/**
 * Set reaction role configuration for a guild
 */
function setReactionRoleConfig(guildId, config) {
    const allConfigs = configStore.get('reactionRoleConfig') || {};
    allConfigs[guildId] = config;
    configStore.set('reactionRoleConfig', allConfigs);
}

/**
 * Add a reaction role to a message
 */
function addReactionRole(guildId, messageId, emoji, roleId, mode = 'normal') {
    const config = getReactionRoleConfig(guildId);
    
    if (!config[messageId]) {
        config[messageId] = {
            roles: {},
            mode: mode // normal, unique (only one role at a time)
        };
    }
    
    config[messageId].roles[emoji] = roleId;
    setReactionRoleConfig(guildId, config);
}

/**
 * Remove a reaction role from a message
 */
function removeReactionRole(guildId, messageId, emoji) {
    const config = getReactionRoleConfig(guildId);
    
    if (config[messageId] && config[messageId].roles[emoji]) {
        delete config[messageId].roles[emoji];
        
        // If no more roles, delete the message entry
        if (Object.keys(config[messageId].roles).length === 0) {
            delete config[messageId];
        }
        
        setReactionRoleConfig(guildId, config);
        return true;
    }
    
    return false;
}

/**
 * Delete all reaction roles for a message
 */
function deleteReactionRoleMessage(guildId, messageId) {
    const config = getReactionRoleConfig(guildId);
    
    if (config[messageId]) {
        delete config[messageId];
        setReactionRoleConfig(guildId, config);
        return true;
    }
    
    return false;
}

/**
 * Get reaction roles for a specific message
 */
function getMessageReactionRoles(guildId, messageId) {
    const config = getReactionRoleConfig(guildId);
    return config[messageId] || null;
}

/**
 * Handle reaction add (give role)
 */
async function handleReactionAdd(reaction, user, guild) {
    const config = getReactionRoleConfig(guild.id);
    const messageConfig = config[reaction.message.id];
    
    if (!messageConfig) return;
    
    const emoji = reaction.emoji.id || reaction.emoji.name;
    const roleId = messageConfig.roles[emoji];
    
    if (!roleId) return;
    
    try {
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(roleId);
        
        if (!role) {
            console.error(`Role ${roleId} not found in guild ${guild.id}`);
            return;
        }
        
        // If unique mode, remove all other roles from this message first
        if (messageConfig.mode === 'unique') {
            const rolesToRemove = Object.values(messageConfig.roles).filter(r => r !== roleId);
            for (const otherRoleId of rolesToRemove) {
                const otherRole = guild.roles.cache.get(otherRoleId);
                if (otherRole && member.roles.cache.has(otherRoleId)) {
                    await member.roles.remove(otherRole);
                }
            }
        }
        
        if (!member.roles.cache.has(roleId)) {
            await member.roles.add(role);
            console.log(`Gave role ${role.name} to ${user.tag}`);
        }
    } catch (error) {
        console.error('Error handling reaction add:', error);
    }
}

/**
 * Handle reaction remove (remove role)
 */
async function handleReactionRemove(reaction, user, guild) {
    const config = getReactionRoleConfig(guild.id);
    const messageConfig = config[reaction.message.id];
    
    if (!messageConfig) return;
    
    const emoji = reaction.emoji.id || reaction.emoji.name;
    const roleId = messageConfig.roles[emoji];
    
    if (!roleId) return;
    
    try {
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(roleId);
        
        if (!role) return;
        
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            console.log(`Removed role ${role.name} from ${user.tag}`);
        }
    } catch (error) {
        console.error('Error handling reaction remove:', error);
    }
}

/**
 * Handle button click (toggle role)
 */
async function handleButtonRole(interaction, roleId) {
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
        await interaction.reply({ 
            content: '❌ This role no longer exists.', 
            ephemeral: true 
        });
        return;
    }
    
    try {
        // Check if in unique mode
        const config = getReactionRoleConfig(interaction.guild.id);
        const messageConfig = config[interaction.message.id];
        
        if (member.roles.cache.has(roleId)) {
            // Remove role
            await member.roles.remove(role);
            await interaction.reply({ 
                content: `✅ Removed the **${role.name}** role.`, 
                ephemeral: true 
            });
        } else {
            // If unique mode, remove other roles from this message first
            if (messageConfig && messageConfig.mode === 'unique') {
                const rolesToRemove = Object.values(messageConfig.roles).filter(r => r !== roleId);
                for (const otherRoleId of rolesToRemove) {
                    const otherRole = interaction.guild.roles.cache.get(otherRoleId);
                    if (otherRole && member.roles.cache.has(otherRoleId)) {
                        await member.roles.remove(otherRole);
                    }
                }
            }
            
            // Add role
            await member.roles.add(role);
            await interaction.reply({ 
                content: `✅ Gave you the **${role.name}** role!`, 
                ephemeral: true 
            });
        }
    } catch (error) {
        console.error('Error handling button role:', error);
        await interaction.reply({ 
            content: '❌ Failed to toggle role. Make sure I have permission to manage roles.', 
            ephemeral: true 
        });
    }
}

module.exports = {
    getReactionRoleConfig,
    setReactionRoleConfig,
    addReactionRole,
    removeReactionRole,
    deleteReactionRoleMessage,
    getMessageReactionRoles,
    handleReactionAdd,
    handleReactionRemove,
    handleButtonRole
};
