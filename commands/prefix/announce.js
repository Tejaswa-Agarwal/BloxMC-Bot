const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'announce',
    description: 'Send an announcement to a channel',
    async execute(message, args) {
        if (!message.guild) {
            message.channel.send('This command can only be used in a server.');
            return;
        }

        if (args.length < 2) {
            message.channel.send('Usage: !announce <#channel|channelID> <message>');
            return;
        }

        const channelMention = args[0];
        const announcement = args.slice(1).join(' ');

        // Extract channel ID from mention or direct ID
        const channelId = channelMention.replace(/[<#>]/g, '');
        
        try {
            const channel = await message.guild.channels.fetch(channelId);
            
            if (!channel || !channel.isTextBased()) {
                message.channel.send('Invalid channel. Please mention a text channel or provide a valid channel ID.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('📢 Announcement')
                .setDescription(announcement)
                .setColor(0xFFD700)
                .setFooter({ text: `Announced by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            message.channel.send(`✅ Announcement sent to ${channel}`);
        } catch (error) {
            console.error('Error sending announcement:', error);
            message.channel.send('Failed to send announcement. Make sure I have permission to send messages in that channel.');
        }
    }
};
