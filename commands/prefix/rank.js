const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

const levelsFilePath = path.join(__dirname, '..', '..', 'data', 'levels.json');

function loadLevelsData() {
    if (fs.existsSync(levelsFilePath)) {
        const rawData = fs.readFileSync(levelsFilePath);
        return JSON.parse(rawData);
    }
    return {};
}

module.exports = {
    name: 'rank',
    description: 'Display your current rank and level',
    async execute(message, args) {
        const levelsData = loadLevelsData();
        const userId = message.author.id;
        const userData = levelsData[userId];

        if (!userData) {
            return message.reply('You have no rank data yet.');
        }

        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#23272A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw username
        ctx.font = '28px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(message.author.username, 50, 50);

        // Draw level
        ctx.font = '24px sans-serif';
        ctx.fillText(`Level: ${userData.level}`, 50, 100);

        // Draw XP bar background
        ctx.fillStyle = '#484b4E';
        ctx.fillRect(50, 150, 600, 40);

        // Calculate XP progress
        const xpForNextLevel = 5 * (userData.level ** 2) + 50 * userData.level + 100;
        const xpProgress = Math.min(userData.xp / xpForNextLevel, 1);

        // Draw XP bar fill
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(50, 150, 600 * xpProgress, 40);

        // Draw XP text
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${userData.xp} / ${xpForNextLevel} XP`, 50, 145);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'rank-image.png');
        message.channel.send({ files: [attachment] });
    }
};
