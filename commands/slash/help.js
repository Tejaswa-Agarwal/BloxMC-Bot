const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: '📚 Command Guide', iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle('Available Bot Commands')
            .setColor(0x5865F2)
            .setDescription('Use `/command` or `k!command` to execute commands')
            .addFields(
                { 
                    name: '🛡️ Moderation Commands', 
                    value: '```css\n' +
                           '/ban • /unban • /kick • /timeout\n' +
                           '/purge • /purgeuser • /slowmode\n' +
                           '/lock • /unlock\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🔧 Utility Commands', 
                    value: '```css\n' +
                           '/help • /ping • /avatar • /userinfo\n' +
                           '/serverinfo • /botinfo • /roleinfo\n' +
                           '/leaderboard • /invite\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '⚙️ Admin Commands', 
                    value: '```css\n' +
                           '/announce • /say • /command\n' +
                           '/logs\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🎮 Fun Commands', 
                    value: '```css\n' +
                           '/8ball • /coinflip • /roll • /poll\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🎉 Giveaway Commands', 
                    value: '```css\n' +
                           '/giveaway • /giveaway-reroll\n' +
                           '```',
                    inline: false 
                }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
