const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const { getEditedMessages } = require('../../utils/snipe');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editsnipe')
        .setDescription('View recently edited messages')
        .addIntegerOption(option =>
            option.setName('index')
                .setDescription('Which edited message to show (1 = most recent)')
                .setMinValue(1)
                .setMaxValue(5)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const index = (interaction.options.getInteger('index') || 1) - 1;
        const messages = getEditedMessages(interaction.guild.id, interaction.channel.id, index + 1);

        if (messages.length === 0 || !messages[index]) {
            const embed = EmbedTemplate.warning(
                'No Edited Messages',
                'There are no recently edited messages in this channel.'
            );
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }

        const msg = messages[index];
        const timeSince = Math.floor((Date.now() - msg.timestamp) / 1000);

        const embed = new EmbedBuilder()
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatar })
            .setColor('#FFA500')
            .addFields(
                { name: '📝 Before', value: msg.oldContent || '*[No text content]*', inline: false },
                { name: '✏️ After', value: msg.newContent || '*[No text content]*', inline: false }
            )
            .setFooter({ text: `Edited ${timeSince}s ago in #${msg.channelName}` })
            .setTimestamp(msg.timestamp);

        if (msg.messageUrl) {
            embed.addFields({ name: '🔗 Jump to Message', value: `[Click here](${msg.messageUrl})` });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
