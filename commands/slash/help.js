const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: '📚 Command Guide', iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle('Available Bot Commands')
            .setColor('#0099FF')
            .setDescription('Use `/command` or `k!command` to execute commands')
            .addFields(
                { 
                    name: '🛡️ Moderation Commands', 
                    value: '```fix\n' +
                           '/ban • /unban • /kick • /timeout\n' +
                           '/warn • /warnings • /removewarn\n' +
                           '/cases • /removecase • /clearwarns\n' +
                           '/slowmode • /lock • /unlock\n' +
                           '/purge • /setnick • /snipe • /editsnipe\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🎫 Ticket System', 
                    value: '```css\n' +
                           '/ticket-setup • /ticket create\n' +
                           '/ticket close • /ticket add\n' +
                           '/ticket remove\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🎨 Reaction Roles', 
                    value: '```css\n' +
                           '/reactionrole create • /reactionrole add\n' +
                           '/reactionrole remove • /reactionrole delete\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '📊 Advanced Logging', 
                    value: '```css\n' +
                           '/logging setup • /logging view\n' +
                           '/logging disable\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🛡️ Enhanced Automod', 
                    value: '```css\n' +
                           '/automod enable • /automod config\n' +
                           '/automod antispam • /automod anticaps\n' +
                           '/automod punishment • /automod whitelist\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🔧 Utility Commands', 
                    value: '```css\n' +
                           '/help • /ping • /avatar • /afk\n' +
                           '/userinfo • /serverinfo • /warnings • /suggest\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '⚙️ Admin Commands', 
                    value: '```css\n' +
                           '/announce • /command • /logs\n' +
                           '/setuproles • /setbotname • /setbotavatar\n' +
                           '/welcomer • /starboard • /verify • /tags • /notes\n' +
                           '```',
                    inline: false 
                },
                { 
                    name: '🎮 Fun Commands', 
                    value: '```css\n' +
                           '/8ball • /poll\n' +
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
                text: `${interaction.client.user.username} • 41 Commands Available`, 
                iconURL: interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
