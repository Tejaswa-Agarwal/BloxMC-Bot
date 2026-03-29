// Store recently deleted and edited messages
const deletedMessages = new Map(); // guildId -> array of messages
const editedMessages = new Map(); // guildId -> array of messages

const MAX_SNIPE_MESSAGES = 5;
const SNIPE_EXPIRY = 5 * 60 * 1000; // 5 minutes

function cleanupOldMessages() {
    const now = Date.now();
    
    for (const [guildId, messages] of deletedMessages.entries()) {
        const filtered = messages.filter(msg => now - msg.timestamp < SNIPE_EXPIRY);
        if (filtered.length === 0) {
            deletedMessages.delete(guildId);
        } else {
            deletedMessages.set(guildId, filtered);
        }
    }

    for (const [guildId, messages] of editedMessages.entries()) {
        const filtered = messages.filter(msg => now - msg.timestamp < SNIPE_EXPIRY);
        if (filtered.length === 0) {
            editedMessages.delete(guildId);
        } else {
            editedMessages.set(guildId, filtered);
        }
    }
}

// Cleanup every minute
setInterval(cleanupOldMessages, 60000);

function addDeletedMessage(message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content && message.attachments.size === 0) return;

    const guildId = message.guild.id;
    const channelId = message.channel.id;

    const messageData = {
        content: message.content,
        author: {
            id: message.author.id,
            tag: message.author.tag,
            avatar: message.author.displayAvatarURL()
        },
        channelId: channelId,
        channelName: message.channel.name,
        timestamp: Date.now(),
        attachments: Array.from(message.attachments.values()).map(att => ({
            name: att.name,
            url: att.url,
            contentType: att.contentType
        }))
    };

    if (!deletedMessages.has(guildId)) {
        deletedMessages.set(guildId, []);
    }

    const messages = deletedMessages.get(guildId);
    messages.unshift(messageData); // Add to beginning
    
    if (messages.length > MAX_SNIPE_MESSAGES) {
        messages.pop(); // Remove oldest
    }
}

function addEditedMessage(oldMessage, newMessage) {
    if (newMessage.author.bot) return;
    if (!newMessage.guild) return;
    if (oldMessage.content === newMessage.content) return;

    const guildId = newMessage.guild.id;
    const channelId = newMessage.channel.id;

    const messageData = {
        oldContent: oldMessage.content,
        newContent: newMessage.content,
        author: {
            id: newMessage.author.id,
            tag: newMessage.author.tag,
            avatar: newMessage.author.displayAvatarURL()
        },
        channelId: channelId,
        channelName: newMessage.channel.name,
        timestamp: Date.now(),
        messageUrl: newMessage.url
    };

    if (!editedMessages.has(guildId)) {
        editedMessages.set(guildId, []);
    }

    const messages = editedMessages.get(guildId);
    messages.unshift(messageData);
    
    if (messages.length > MAX_SNIPE_MESSAGES) {
        messages.pop();
    }
}

function getDeletedMessages(guildId, channelId = null, limit = 1) {
    const messages = deletedMessages.get(guildId) || [];
    
    if (channelId) {
        return messages.filter(msg => msg.channelId === channelId).slice(0, limit);
    }
    
    return messages.slice(0, limit);
}

function getEditedMessages(guildId, channelId = null, limit = 1) {
    const messages = editedMessages.get(guildId) || [];
    
    if (channelId) {
        return messages.filter(msg => msg.channelId === channelId).slice(0, limit);
    }
    
    return messages.slice(0, limit);
}

module.exports = {
    addDeletedMessage,
    addEditedMessage,
    getDeletedMessages,
    getEditedMessages
};
