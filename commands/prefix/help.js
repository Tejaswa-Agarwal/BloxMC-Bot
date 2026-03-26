const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Display all available commands',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('📋 Bot Commands')
            .setColor(0x0099FF)
            .setDescription('Here are all the available commands:')
            .addFields(
                { 
                    name: '🛡️ Moderation Commands', 
                    value: '`!ban <@user|ID> [reason]` - Ban a user\n' +
                           '`!unban <userID> [reason]` - Unban a user\n' +
                           '`!kick <@user|ID> [reason]` - Kick a user\n' +
                           '`!timeout <@user|ID> <duration> [reason]` - Timeout a user\n' +
                           '`!purge <amount>` - Delete messages\n' +
                           '`!purgeuser <@user|ID> <amount>` - Delete user messages',
                    inline: false 
                },
                { 
                    name: '🔧 Utility Commands', 
                    value: '`!help` - Show this help message\n' +
                           '`!ping` - Check bot latency\n' +
                           '`!avatar [@user]` - Show user avatar\n' +
                           '`!userinfo [@user]` - Show user information\n' +
                           '`!serverinfo` - Show server information\n' +
                           '`!leaderboard` - Show XP leaderboard',
                    inline: false 
                },
                { 
                    name: '⚙️ Admin Commands', 
                    value: '`!announce <channel> <message>` - Send announcement\n' +
                           '`!command <enable|disable> <command>` - Toggle commands',
                    inline: false 
                },
                { 
                    name: '🎉 Giveaway Commands', 
                    value: '`!giveaway` - Create a giveaway\n' +
                           'Use slash command `/giveaway-reroll` to reroll',
                    inline: false 
                }
            )
            .setFooter({ text: 'You can also use slash commands (/) for most commands!' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
