const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Display user information',
    async execute(message, args) {
        if (!message.guild) {
            message.channel.send('This command can only be used in a server.');
            return;
        }

        const user = message.mentions.users.first() || message.author;
        const member = await message.guild.members.fetch(user.id);
        
        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);
        
        const embed = new EmbedBuilder()
            .setTitle('User Information')
            .setColor(member.displayHexColor || 0x0099FF)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: user.tag, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Boost Status', value: member.premiumSince ? `Boosting since <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : 'Not boosting', inline: true },
                { name: `Roles [${member.roles.cache.size - 1}]`, value: roles.length > 0 ? roles.join(', ') : 'None', inline: false }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
