const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display server information'),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
            .setTitle('📊 Server Information')
            .setColor(0x5865F2)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👑 Owner', value: `${owner.user.tag}`, inline: true },
                { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Members', value: `\`\`\`yaml\nTotal: ${guild.memberCount}\nHumans: ${guild.members.cache.filter(m => !m.user.bot).size}\nBots: ${guild.members.cache.filter(m => m.user.bot).size}\`\`\``, inline: true },
                { name: '📺 Channels', value: `\`\`\`yaml\nText: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}\`\`\``, inline: true },
                { name: '🚀 Boosts', value: `\`\`\`yaml\nLevel: ${guild.premiumTier}\nBoosts: ${guild.premiumSubscriptionCount || 0}\`\`\``, inline: true },
                { name: '🎭 Roles', value: `\`${guild.roles.cache.size}\``, inline: true },
                { name: '😀 Emojis', value: `\`${guild.emojis.cache.size}\``, inline: true },
                { name: '💬 Stickers', value: `\`${guild.stickers.cache.size}\``, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        if (guild.description) {
            embed.setDescription(`*${guild.description}*`);
        }

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
