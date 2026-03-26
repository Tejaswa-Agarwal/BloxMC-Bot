const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display user information')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 15);
        
        const userFlags = user.flags?.toArray() || [];
        const badges = userFlags.map(flag => {
            const badgeEmojis = {
                'Staff': '👮',
                'Partner': '🤝',
                'Hypesquad': '🎉',
                'BugHunterLevel1': '🐛',
                'BugHunterLevel2': '🐛',
                'HypeSquadOnlineHouse1': '<:bravery:123>',
                'HypeSquadOnlineHouse2': '<:brilliance:123>',
                'HypeSquadOnlineHouse3': '<:balance:123>',
                'PremiumEarlySupporter': '⭐',
                'VerifiedDeveloper': '⚙️',
                'CertifiedModerator': '🛡️'
            };
            return badgeEmojis[flag] || flag;
        }).join(' ') || 'None';
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle('📊 User Information')
            .setColor(member.displayHexColor || 0x3498DB)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Username', value: `\`${user.tag}\``, inline: true },
                { name: '🆔 User ID', value: `\`${user.id}\``, inline: true },
                { name: '📝 Nickname', value: member.nickname ? `\`${member.nickname}\`` : '`None`', inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>\n<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>\n<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🚀 Boost Status', value: member.premiumSince ? `Boosting since <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : '`Not boosting`', inline: true },
                { name: '🏅 Badges', value: badges, inline: false },
                { name: `🎭 Roles [${member.roles.cache.size - 1}]`, value: roles.length > 0 ? roles.join(', ') : '`None`', inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
