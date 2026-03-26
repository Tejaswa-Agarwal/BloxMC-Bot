const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../../utils/modLog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel (allow @everyone to send messages)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to unlock (defaults to current)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!channel.isTextBased()) {
            return interaction.editReply({ content: '❌ Cannot unlock this channel type.', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: null
            });
            
            await interaction.editReply(`🔓 ${channel} has been **unlocked**`);
            await channel.send(`🔓 This channel has been unlocked by ${interaction.user}`);
            
            // Send to mod log
            await sendModLog(interaction.guild, 'unlock', interaction.user, `#${channel.name}`, 'Channel unlocked', { '📍 Channel': channel.toString() });
        } catch (error) {
            console.error('Error unlocking channel:', error);
            await interaction.editReply({ content: '❌ Failed to unlock channel. Make sure I have Manage Channels permission.', ephemeral: true });
        }
    }
};