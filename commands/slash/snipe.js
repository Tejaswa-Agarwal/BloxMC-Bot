const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const { getDeletedMessages, getEditedMessages } = require('../../utils/snipe');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('View recently deleted messages')
        .addIntegerOption(option =>
            option.setName('index')
                .setDescription('Which deleted message to show (1 = most recent)')
                .setMinValue(1)
                .setMaxValue(5)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const index = (interaction.options.getInteger('index') || 1) - 1;
        const messages = getDeletedMessages(interaction.guild.id, interaction.channel.id, index + 1);

        if (messages.length === 0 || !messages[index]) {
            const embed = EmbedTemplate.warning(
                'No Deleted Messages',
                'There are no recently deleted messages in this channel.'
            );
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }

        const msg = messages[index];
        const timeSince = Math.floor((Date.now() - msg.timestamp) / 1000);

        const embed = new EmbedBuilder()
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatar })
            .setDescription(msg.content || '*[No text content]*')
            .setColor('#FF0000')
            .setFooter({ text: `Deleted ${timeSince}s ago in #${msg.channelName}` })
            .setTimestamp(msg.timestamp);

        if (msg.attachments.length > 0) {
            const attachment = msg.attachments[0];
            if (attachment.contentType?.startsWith('image/')) {
                embed.setImage(attachment.url);
            }
            
            if (msg.attachments.length > 1) {
                embed.addFields({ 
                    name: '📎 Attachments', 
                    value: msg.attachments.map(att => `[${att.name}](${att.url})`).join('\n') 
                });
            }
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
