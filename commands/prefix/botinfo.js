const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'botinfo',
    description: 'Display bot information and statistics',
    async execute(message, args) {
        const client = message.client;
        
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle('🤖 Bot Information')
            .setColor(0x5865F2)
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '📊 Statistics', value: `\`\`\`yaml\nServers: ${client.guilds.cache.size}\nUsers: ${totalMembers}\nChannels: ${totalChannels}\`\`\``, inline: false },
                { name: '⏱️ Uptime', value: `\`\`\`${days}d ${hours}h ${minutes}m ${seconds}s\`\`\``, inline: true },
                { name: '💾 Memory', value: `\`\`\`${memoryUsage} MB\`\`\``, inline: true },
                { name: '📡 Ping', value: `\`\`\`${Math.round(client.ws.ping)} ms\`\`\``, inline: true },
                { name: '📚 Library', value: '`Discord.js v14`', inline: true },
                { name: '🖥️ Platform', value: `\`${process.platform}\``, inline: true },
                { name: '🔧 Node.js', value: `\`${process.version}\``, inline: true }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};