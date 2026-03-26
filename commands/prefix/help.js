const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Display all available commands',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: '📚 Command Guide', iconURL: message.client.user.displayAvatarURL() })
            .setTitle('Available Bot Commands')
            .setColor(0x5865F2)
            .setDescription('Use `/command` or `!command` to execute commands')
            .addFields(
                { 
                    name: '🛡️ Moderation Commands', 
                    value: '```css\n' +
                           '!ban • !unban • !kick • !timeout\n' +
                           '!purge • !purgeuser • !slowmode\n' +
                           '!lock • !unlock\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🔧 Utility Commands', 
                    value: '```css\n' +
                           '!help • !ping • !avatar • !userinfo\n' +
                           '!serverinfo • !botinfo • !roleinfo\n' +
                           '!leaderboard • !invite\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '⚙️ Admin Commands', 
                    value: '```css\n' +
                           '!announce • !say • !command\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🎮 Fun Commands', 
                    value: '```css\n' +
                           '!8ball • !coinflip • !roll • !poll\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🎉 Giveaway Commands', 
                    value: '```css\n' +
                           '!giveaway\n' +
                           '```',
                    inline: false 
                }
            )
            .setThumbnail(message.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ 
                text: `Requested by ${message.author.tag}`, 
                iconURL: message.author.displayAvatarURL() 
            })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
