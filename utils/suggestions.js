const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

function getSuggestionConfig(guildId) {
    const config = getConfig();
    return config[guildId]?.suggestionConfig || null;
}

async function createSuggestion(interaction, suggestion) {
    const config = getSuggestionConfig(interaction.guild.id);
    if (!config || !config.enabled) {
        return { success: false, message: 'Suggestions are not enabled in this server.' };
    }

    const channel = await interaction.guild.channels.fetch(config.channelId).catch(() => null);
    if (!channel) {
        return { success: false, message: 'Suggestion channel not found.' };
    }

    const fullConfig = getConfig();
    const suggestionNumber = (fullConfig[interaction.guild.id].suggestionConfig.counter || 0) + 1;
    fullConfig[interaction.guild.id].suggestionConfig.counter = suggestionNumber;
    saveConfig(fullConfig);

    const embed = new EmbedBuilder()
        .setAuthor({ 
            name: `Suggestion #${suggestionNumber}`,
            iconURL: interaction.user.displayAvatarURL() 
        })
        .setDescription(suggestion)
        .setColor('#0099FF')
        .addFields(
            { name: '👤 Suggested by', value: interaction.user.tag, inline: true },
            { name: '📊 Status', value: '🔹 Pending', inline: true },
            { name: '📈 Votes', value: '👍 0 | 👎 0', inline: true }
        )
        .setFooter({ text: `Suggestion ID: ${suggestionNumber}` })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`suggestion_upvote_${suggestionNumber}`)
                .setLabel('0')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`suggestion_downvote_${suggestionNumber}`)
                .setLabel('0')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`suggestion_info_${suggestionNumber}`)
                .setLabel('Info')
                .setEmoji('ℹ️')
                .setStyle(ButtonStyle.Secondary)
        );

    try {
        const message = await channel.send({ embeds: [embed], components: [row] });

        // Store suggestion data
        if (!fullConfig[interaction.guild.id].suggestionConfig.suggestions) {
            fullConfig[interaction.guild.id].suggestionConfig.suggestions = {};
        }
        fullConfig[interaction.guild.id].suggestionConfig.suggestions[suggestionNumber] = {
            messageId: message.id,
            authorId: interaction.user.id,
            suggestion: suggestion,
            upvotes: [],
            downvotes: [],
            status: 'pending',
            timestamp: Date.now()
        };
        saveConfig(fullConfig);

        return { success: true, suggestionNumber, messageUrl: message.url };
    } catch (error) {
        console.error('Error creating suggestion:', error);
        return { success: false, message: 'Failed to create suggestion.' };
    }
}

async function handleSuggestionVote(interaction) {
    const [, action, suggestionId] = interaction.customId.split('_');
    const config = getConfig();
    const suggestionData = config[interaction.guild.id]?.suggestionConfig?.suggestions?.[suggestionId];

    if (!suggestionData) {
        await interaction.reply({ content: '❌ Suggestion not found.', ephemeral: true });
        return;
    }

    const userId = interaction.user.id;
    let upvotes = suggestionData.upvotes || [];
    let downvotes = suggestionData.downvotes || [];

    if (action === 'upvote') {
        if (upvotes.includes(userId)) {
            // Remove upvote
            upvotes = upvotes.filter(id => id !== userId);
        } else {
            // Add upvote, remove downvote if exists
            upvotes.push(userId);
            downvotes = downvotes.filter(id => id !== userId);
        }
    } else if (action === 'downvote') {
        if (downvotes.includes(userId)) {
            // Remove downvote
            downvotes = downvotes.filter(id => id !== userId);
        } else {
            // Add downvote, remove upvote if exists
            downvotes.push(userId);
            upvotes = upvotes.filter(id => id !== userId);
        }
    } else if (action === 'info') {
        const author = await interaction.client.users.fetch(suggestionData.authorId).catch(() => null);
        const infoEmbed = new EmbedBuilder()
            .setTitle(`Suggestion #${suggestionId} - Details`)
            .setDescription(suggestionData.suggestion)
            .setColor('#0099FF')
            .addFields(
                { name: '👤 Author', value: author ? author.tag : 'Unknown', inline: true },
                { name: '📊 Status', value: suggestionData.status === 'approved' ? '✅ Approved' : suggestionData.status === 'denied' ? '❌ Denied' : '🔹 Pending', inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(suggestionData.timestamp / 1000)}:R>`, inline: true },
                { name: '👍 Upvotes', value: upvotes.length.toString(), inline: true },
                { name: '👎 Downvotes', value: downvotes.length.toString(), inline: true }
            );

        await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        return;
    }

    // Update data
    suggestionData.upvotes = upvotes;
    suggestionData.downvotes = downvotes;
    config[interaction.guild.id].suggestionConfig.suggestions[suggestionId] = suggestionData;
    saveConfig(config);

    // Update message
    const embed = interaction.message.embeds[0];
    const newEmbed = EmbedBuilder.from(embed)
        .setFields(
            { name: '👤 Suggested by', value: embed.fields[0].value, inline: true },
            { name: '📊 Status', value: embed.fields[1].value, inline: true },
            { name: '📈 Votes', value: `👍 ${upvotes.length} | 👎 ${downvotes.length}`, inline: true }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`suggestion_upvote_${suggestionId}`)
                .setLabel(upvotes.length.toString())
                .setEmoji('👍')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`suggestion_downvote_${suggestionId}`)
                .setLabel(downvotes.length.toString())
                .setEmoji('👎')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`suggestion_info_${suggestionId}`)
                .setLabel('Info')
                .setEmoji('ℹ️')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.update({ embeds: [newEmbed], components: [row] });
}

async function updateSuggestionStatus(guild, suggestionId, status, reason) {
    const config = getConfig();
    const suggestionData = config[guild.id]?.suggestionConfig?.suggestions?.[suggestionId];

    if (!suggestionData) return { success: false };

    const channelId = config[guild.id].suggestionConfig.channelId;
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return { success: false };

    const message = await channel.messages.fetch(suggestionData.messageId).catch(() => null);
    if (!message) return { success: false };

    suggestionData.status = status;
    suggestionData.statusReason = reason;
    config[guild.id].suggestionConfig.suggestions[suggestionId] = suggestionData;
    saveConfig(config);

    const embed = message.embeds[0];
    const statusText = status === 'approved' ? '✅ Approved' : status === 'denied' ? '❌ Denied' : '🔹 Pending';
    const color = status === 'approved' ? '#00FF00' : status === 'denied' ? '#FF0000' : '#0099FF';

    const newEmbed = EmbedBuilder.from(embed)
        .setColor(color)
        .setFields(
            { name: '👤 Suggested by', value: embed.fields[0].value, inline: true },
            { name: '📊 Status', value: statusText, inline: true },
            { name: '📈 Votes', value: embed.fields[2].value, inline: true }
        );

    if (reason) {
        newEmbed.addFields({ name: '📝 Reason', value: reason, inline: false });
    }

    await message.edit({ embeds: [newEmbed] });

    return { success: true };
}

module.exports = {
    createSuggestion,
    handleSuggestionVote,
    updateSuggestionStatus,
    getSuggestionConfig
};
