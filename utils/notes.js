const fs = require('fs');
const path = require('path');

const notesPath = path.join(__dirname, '..', 'data', 'notes.json');

function getAllNotes() {
    if (!fs.existsSync(notesPath)) return {};
    return JSON.parse(fs.readFileSync(notesPath, 'utf8'));
}

function saveAllNotes(notes) {
    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
}

function addNote(guildId, userId, moderatorId, moderatorTag, note) {
    const notes = getAllNotes();
    if (!notes[guildId]) notes[guildId] = {};
    if (!notes[guildId][userId]) notes[guildId][userId] = [];
    const entry = {
        id: Date.now().toString(),
        note,
        moderatorId,
        moderatorTag,
        timestamp: Date.now(),
    };
    notes[guildId][userId].push(entry);
    saveAllNotes(notes);
    return entry;
}

function getUserNotes(guildId, userId) {
    const notes = getAllNotes();
    return notes[guildId]?.[userId] || [];
}

function removeNote(guildId, userId, noteId) {
    const notes = getAllNotes();
    if (!notes[guildId]?.[userId]) return false;
    const before = notes[guildId][userId].length;
    notes[guildId][userId] = notes[guildId][userId].filter(n => n.id !== noteId);
    if (notes[guildId][userId].length === 0) delete notes[guildId][userId];
    saveAllNotes(notes);
    return before !== (notes[guildId]?.[userId]?.length || 0);
}

module.exports = {
    addNote,
    getUserNotes,
    removeNote,
};

