const { EmbedBuilder } = require('discord.js');

// In-memory storage for AFK users
const afkUsers = new Map();

function setAFK(userId, reason, timestamp) {
    afkUsers.set(userId, {
        reason: reason || 'AFK',
        timestamp: timestamp || Date.now()
    });
}

function removeAFK(userId) {
    return afkUsers.delete(userId);
}

function getAFK(userId) {
    return afkUsers.get(userId);
}

function isAFK(userId) {
    return afkUsers.has(userId);
}

async function checkAFKMentions(message) {
    if (message.author.bot) return;

    // Check if message author is AFK and remove it
    if (isAFK(message.author.id)) {
        removeAFK(message.author.id);
        const embed = new EmbedBuilder()
            .setDescription(`👋 Welcome back, ${message.author}! Your AFK status has been removed.`)
            .setColor('#00FF00');
        
        const reply = await message.reply({ embeds: [embed] });
        setTimeout(() => reply.delete().catch(() => {}), 5000);
    }

    // Check if any mentioned users are AFK
    const mentions = message.mentions.users;
    if (mentions.size > 0) {
        const afkMentions = [];
        
        mentions.forEach(user => {
            if (isAFK(user.id)) {
                const afkData = getAFK(user.id);
                const timeSince = Math.floor((Date.now() - afkData.timestamp) / 1000);
                afkMentions.push(`**${user.tag}** is AFK: ${afkData.reason} (<t:${Math.floor(afkData.timestamp / 1000)}:R>)`);
            }
        });

        if (afkMentions.length > 0) {
            const embed = new EmbedBuilder()
                .setTitle('💤 AFK Users')
                .setDescription(afkMentions.join('\n'))
                .setColor('#FFA500');
            
            const reply = await message.reply({ embeds: [embed] });
            setTimeout(() => reply.delete().catch(() => {}), 10000);
        }
    }
}

function getAllAFK() {
    return Array.from(afkUsers.entries());
}

module.exports = {
    setAFK,
    removeAFK,
    getAFK,
    isAFK,
    checkAFKMentions,
    getAllAFK
};
