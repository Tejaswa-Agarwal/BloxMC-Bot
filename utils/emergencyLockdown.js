const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

const lockdownFile = path.join(__dirname, '..', 'data', 'emergencyLockdown.json');

function readLockdownData() {
    if (!fs.existsSync(lockdownFile)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(lockdownFile, 'utf8'));
}

function writeLockdownData(data) {
    fs.writeFileSync(lockdownFile, JSON.stringify(data, null, 2));
}

function serializeOverwrite(channel, everyoneRoleId) {
    const overwrite = channel.permissionOverwrites.cache.get(everyoneRoleId);
    if (!overwrite) {
        return null;
    }

    return {
        sendMessages: overwrite.allow.has(PermissionFlagsBits.SendMessages)
            ? true
            : overwrite.deny.has(PermissionFlagsBits.SendMessages) ? false : null,
        addReactions: overwrite.allow.has(PermissionFlagsBits.AddReactions)
            ? true
            : overwrite.deny.has(PermissionFlagsBits.AddReactions) ? false : null,
        sendMessagesInThreads: overwrite.allow.has(PermissionFlagsBits.SendMessagesInThreads)
            ? true
            : overwrite.deny.has(PermissionFlagsBits.SendMessagesInThreads) ? false : null,
        connect: overwrite.allow.has(PermissionFlagsBits.Connect)
            ? true
            : overwrite.deny.has(PermissionFlagsBits.Connect) ? false : null,
        speak: overwrite.allow.has(PermissionFlagsBits.Speak)
            ? true
            : overwrite.deny.has(PermissionFlagsBits.Speak) ? false : null,
    };
}

async function applyEmergencyLockdown(guild) {
    const data = readLockdownData();
    const guildData = data[guild.id] || {};
    if (guildData.active) {
        return { ok: false, alreadyActive: true };
    }

    const everyoneRoleId = guild.roles.everyone.id;
    const snapshot = {};
    let lockedCount = 0;

    for (const channel of guild.channels.cache.values()) {
        if (!channel || !channel.manageable) continue;
        snapshot[channel.id] = serializeOverwrite(channel, everyoneRoleId);

        const overwriteUpdate = {};
        if (channel.isTextBased()) {
            overwriteUpdate.SendMessages = false;
            overwriteUpdate.AddReactions = false;
            overwriteUpdate.SendMessagesInThreads = false;
        }
        if (channel.isVoiceBased()) {
            overwriteUpdate.Connect = false;
            overwriteUpdate.Speak = false;
        }

        if (Object.keys(overwriteUpdate).length === 0) continue;
        await channel.permissionOverwrites.edit(everyoneRoleId, overwriteUpdate);
        lockedCount++;
    }

    data[guild.id] = {
        active: true,
        createdAt: Date.now(),
        snapshot
    };
    writeLockdownData(data);

    return { ok: true, lockedCount };
}

async function liftEmergencyLockdown(guild) {
    const data = readLockdownData();
    const guildData = data[guild.id];
    if (!guildData || !guildData.active) {
        return { ok: false, notActive: true };
    }

    const everyoneRoleId = guild.roles.everyone.id;
    let restoredCount = 0;

    for (const channel of guild.channels.cache.values()) {
        if (!channel || !channel.manageable) continue;

        const saved = guildData.snapshot?.[channel.id] || null;
        if (!saved) {
            continue;
        }

        await channel.permissionOverwrites.edit(everyoneRoleId, {
            SendMessages: saved.sendMessages,
            AddReactions: saved.addReactions,
            SendMessagesInThreads: saved.sendMessagesInThreads,
            Connect: saved.connect,
            Speak: saved.speak
        });
        restoredCount++;
    }

    delete data[guild.id];
    writeLockdownData(data);

    return { ok: true, restoredCount };
}

module.exports = {
    applyEmergencyLockdown,
    liftEmergencyLockdown
};
