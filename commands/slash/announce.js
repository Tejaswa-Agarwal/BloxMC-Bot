const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the announcement to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The announcement message')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        const channel = interaction.options.getChannel('channel');
        const announcement = interaction.options.getString('message');

        if (!channel.isTextBased()) {
            await interaction.editReply({ content: 'Please select a text channel.', ephemeral: true });
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setTitle('📢 Announcement')
                .setDescription(announcement)
                .setColor(0xFFD700)
                .setFooter({ text: `Announced by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: `✅ Announcement sent to ${channel}` });
        } catch (error) {
            console.error('Error sending announcement:', error);
            await interaction.editReply({ content: 'Failed to send announcement. Make sure I have permission to send messages in that channel.', ephemeral: true });
        }
    }
};
