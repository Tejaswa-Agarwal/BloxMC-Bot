const configStore = require('../configStore');

const BOT_OWNER_ID = '1124168034332975204';

function getExtraOwnerIds(guildId) {
    const config = configStore.get('extraOwnersConfig') || {};
    const entry = config[guildId] || {};
    return Array.isArray(entry.userIds) ? entry.userIds : [];
}

function hasElevatedOwnership(guildId, userId, guildOwnerId) {
    if (userId === BOT_OWNER_ID || userId === guildOwnerId) return true;
    const extraOwners = getExtraOwnerIds(guildId);
    return extraOwners.includes(userId);
}

/**
 * Check if a user has permission to use moderation commands
 * @param {object} member - Discord member object
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} guildOwnerId - Guild owner ID
 * @returns {boolean} - Whether the user has permission
 */
function hasModeratorPermission(member, guildId, userId, guildOwnerId) {
    // Bot owner, guild owner, and extra owners always have permission
    if (hasElevatedOwnership(guildId, userId, guildOwnerId)) {
        return true;
    }

    const roleConfig = configStore.get('roleConfig') || {};
    const guildConfig = roleConfig[guildId];

    if (!guildConfig) {
        // If no roles configured, deny access
        return false;
    }

    // Check if user has moderator or admin role
    const hasModRole = member.roles.cache.has(guildConfig.moderatorRoleId);
    const hasAdminRole = member.roles.cache.has(guildConfig.adminRoleId);

    return hasModRole || hasAdminRole;
}

/**
 * Check if a user has permission to use admin commands
 * @param {object} member - Discord member object
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID
 * @param {string} guildOwnerId - Guild owner ID
 * @returns {boolean} - Whether the user has permission
 */
function hasAdminPermission(member, guildId, userId, guildOwnerId) {
    // Bot owner, guild owner, and extra owners always have permission
    if (hasElevatedOwnership(guildId, userId, guildOwnerId)) {
        return true;
    }

    const roleConfig = configStore.get('roleConfig') || {};
    const guildConfig = roleConfig[guildId];

    if (!guildConfig) {
        // If no roles configured, deny access
        return false;
    }

    // Only admin role has permission for admin commands
    const hasAdminRole = member.roles.cache.has(guildConfig.adminRoleId);

    return hasAdminRole;
}

module.exports = {
    hasModeratorPermission,
    hasAdminPermission,
    BOT_OWNER_ID,
    getExtraOwnerIds,
    hasElevatedOwnership,
};
