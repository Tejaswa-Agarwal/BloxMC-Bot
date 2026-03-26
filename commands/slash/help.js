const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📋 Bot Commands')
            .setColor(0x0099FF)
            .setDescription('Here are all the available commands:')
            .addFields(
                { 
                    name: '🛡️ Moderation Commands', 
                    value: '`/ban <user> [reason]` - Ban a user\n' +
                           '`/unban <userid> [reason]` - Unban a user\n' +
                           '`/kick <user> [reason]` - Kick a user\n' +
                           '`/timeout <user> <duration> [reason]` - Timeout a user\n' +
                           '`/purge <amount>` - Delete messages\n' +
                           '`/purgeuser <user> <amount>` - Delete user messages',
                    inline: false 
                },
                { 
                    name: '🔧 Utility Commands', 
                    value: '`/help` - Show this help message\n' +
                           '`/ping` - Check bot latency\n' +
                           '`/avatar [user]` - Show user avatar\n' +
                           '`/userinfo [user]` - Show user information\n' +
                           '`/serverinfo` - Show server information\n' +
                           '`/leaderboard` - Show XP leaderboard',
                    inline: false 
                },
                { 
                    name: '⚙️ Admin Commands', 
                    value: '`/announce <channel> <message>` - Send announcement\n' +
                           '`/command <action> <command>` - Toggle commands\n' +
                           '`/logs <channel>` - Set logging channel',
                    inline: false 
                },
                { 
                    name: '🎉 Giveaway Commands', 
                    value: '`/giveaway` - Create a giveaway\n' +
                           '`/giveaway-reroll` - Reroll a giveaway',
                    inline: false 
                }
            )
            .setFooter({ text: 'You can also use prefix commands (!) for most commands!' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
