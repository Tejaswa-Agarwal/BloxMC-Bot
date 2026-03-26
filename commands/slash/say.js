const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send to (defaults to current)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('embed')
                .setDescription('Send as an embed')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const messageContent = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const useEmbed = interaction.options.getBoolean('embed') || false;

        if (!channel.isTextBased()) {
            return interaction.editReply({ content: '❌ Cannot send messages to this channel type.', ephemeral: true });
        }

        try {
            if (useEmbed) {
                const embed = new EmbedBuilder()
                    .setDescription(messageContent)
                    .setColor(0x5865F2)
                    .setTimestamp();
                
                await channel.send({ embeds: [embed] });
            } else {
                await channel.send(messageContent);
            }
            
            await interaction.editReply({ content: `✅ Message sent to ${channel}`, ephemeral: true });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.editReply({ content: '❌ Failed to send message. Make sure I have permission to send messages in that channel.', ephemeral: true });
        }
    }
};