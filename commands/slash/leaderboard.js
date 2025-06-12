const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const levelsFilePath = path.join(__dirname, '..', '..', 'data', 'levels.json');

function loadLevelsData() {
    if (fs.existsSync(levelsFilePath)) {
        const rawData = fs.readFileSync(levelsFilePath);
        return JSON.parse(rawData);
    }
    return {};
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the top users by level'),
    async execute(interaction) {
        const levelsData = loadLevelsData();

        const sortedUsers = Object.entries(levelsData)
            .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp)
            .slice(0, 10);

        if (sortedUsers.length === 0) {
            return interaction.reply({ content: 'No leaderboard data available.', ephemeral: true });
        }

        let leaderboard = '🏆 **Leaderboard** 🏆\n\n';
        for (let i = 0; i < sortedUsers.length; i++) {
            const [userId, data] = sortedUsers[i];
            const user = await interaction.client.users.fetch(userId).catch(() => null);
            const username = user ? user.username : 'Unknown User';
            leaderboard += `**${i + 1}.** ${username} - Level ${data.level} (${data.xp} XP)\n`;
        }

        await interaction.reply(leaderboard);
    }
};
