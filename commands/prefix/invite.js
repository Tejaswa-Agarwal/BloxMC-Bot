const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'invite',
    description: 'Get the bot invite link',
    async execute(message, args) {
        const permissions = [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ModerateMembers,
            PermissionFlagsBits.ManageChannels
        ];
        
        const permissionsInt = permissions.reduce((a, b) => a | b, 0n);
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=${permissionsInt}&scope=bot%20applications.commands`;
        
        const embed = new EmbedBuilder()
            .setTitle('📨 Invite Me!')
            .setDescription(`Click [here](${inviteLink}) to add me to your server!`)
            .setColor(0x5865F2)
            .setThumbnail(message.client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '🔗 Invite Link', value: `[Click Here](${inviteLink})`, inline: false },
                { name: '✨ Features', value: '• Moderation Tools\n• Utility Commands\n• Fun Commands\n• Giveaways\n• Auto Moderation\n• And more!', inline: false }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};