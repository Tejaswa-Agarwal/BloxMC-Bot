const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'data', 'config.json');

function getConfig() {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {};
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getStarboardConfig(guildId) {
    const config = getConfig();
    return config[guildId]?.starboardConfig || null;
}

async function handleStarAdd(reaction, user) {
    if (user.bot) return;
    if (reaction.emoji.name !== '⭐') return;

    const message = reaction.message;
    if (!message.guild) return;

    const starConfig = getStarboardConfig(message.guild.id);
    if (!starConfig || !starConfig.enabled) return;

    const threshold = starConfig.threshold || 3;
    const starCount = reaction.count;

    if (starCount < threshold) return;

    const starboardChannel = await message.guild.channels.fetch(starConfig.channelId).catch(() => null);
    if (!starboardChannel) return;

    // Check if message is already on starboard
    const config = getConfig();
    const starboardMessages = config[message.guild.id].starboardConfig.messages || {};

    if (starboardMessages[message.id]) {
        // Update existing starboard message
        const starboardMsgId = starboardMessages[message.id];
        const starboardMsg = await starboardChannel.messages.fetch(starboardMsgId).catch(() => null);
        
        if (starboardMsg) {
            const embed = starboardMsg.embeds[0];
            const newEmbed = EmbedBuilder.from(embed)
                .setFooter({ text: `⭐ ${starCount} | ${message.channel.name}` });
            
            await starboardMsg.edit({ 
                content: `⭐ **${starCount}** ${message.channel}`,
                embeds: [newEmbed] 
            });
        }
    } else {
        // Create new starboard entry
        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: message.author.tag, 
                iconURL: message.author.displayAvatarURL() 
            })
            .setDescription(message.content || '*[No text content]*')
            .setColor('#FFA500')
            .setTimestamp(message.createdTimestamp)
            .setFooter({ text: `⭐ ${starCount} | ${message.channel.name}` });

        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            if (attachment.contentType?.startsWith('image/')) {
                embed.setImage(attachment.url);
            } else {
                embed.addFields({ name: '📎 Attachment', value: `[${attachment.name}](${attachment.url})` });
            }
        }

        embed.addFields({ 
            name: '🔗 Jump to Message', 
            value: `[Click here](${message.url})` 
        });

        const starboardMsg = await starboardChannel.send({
            content: `⭐ **${starCount}** ${message.channel}`,
            embeds: [embed]
        });

        // Save to config
        if (!config[message.guild.id].starboardConfig.messages) {
            config[message.guild.id].starboardConfig.messages = {};
        }
        config[message.guild.id].starboardConfig.messages[message.id] = starboardMsg.id;
        saveConfig(config);
    }
}

async function handleStarRemove(reaction, user) {
    if (user.bot) return;
    if (reaction.emoji.name !== '⭐') return;

    const message = reaction.message;
    if (!message.guild) return;

    const starConfig = getStarboardConfig(message.guild.id);
    if (!starConfig || !starConfig.enabled) return;

    const threshold = starConfig.threshold || 3;
    const starCount = reaction.count;

    const config = getConfig();
    const starboardMessages = config[message.guild.id].starboardConfig.messages || {};

    if (!starboardMessages[message.id]) return;

    const starboardChannel = await message.guild.channels.fetch(starConfig.channelId).catch(() => null);
    if (!starboardChannel) return;

    const starboardMsgId = starboardMessages[message.id];
    const starboardMsg = await starboardChannel.messages.fetch(starboardMsgId).catch(() => null);

    if (starCount < threshold) {
        // Remove from starboard
        if (starboardMsg) {
            await starboardMsg.delete().catch(() => {});
        }
        delete config[message.guild.id].starboardConfig.messages[message.id];
        saveConfig(config);
    } else if (starboardMsg) {
        // Update count
        const embed = starboardMsg.embeds[0];
        const newEmbed = EmbedBuilder.from(embed)
            .setFooter({ text: `⭐ ${starCount} | ${message.channel.name}` });
        
        await starboardMsg.edit({ 
            content: `⭐ **${starCount}** ${message.channel}`,
            embeds: [newEmbed] 
        });
    }
}

module.exports = {
    handleStarAdd,
    handleStarRemove,
    getStarboardConfig
};
