const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel (prevent @everyone from sending messages)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to lock (defaults to current)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for locking')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!channel.isTextBased()) {
            return interaction.editReply({ content: '❌ Cannot lock this channel type.', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: false
            });
            
            await interaction.editReply(`🔒 ${channel} has been **locked**\nReason: ${reason}`);
            await channel.send(`🔒 This channel has been locked by ${interaction.user}\nReason: ${reason}`);
        } catch (error) {
            console.error('Error locking channel:', error);
            await interaction.editReply({ content: '❌ Failed to lock channel. Make sure I have Manage Channels permission.', ephemeral: true });
        }
    }
};