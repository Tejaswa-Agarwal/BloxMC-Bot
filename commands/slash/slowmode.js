const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendModLog } = require('../../utils/modLog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set channel slowmode delay')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode delay in seconds (0 to disable)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set slowmode for (defaults to current)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!channel.isTextBased()) {
            return interaction.editReply({ content: '❌ This channel type does not support slowmode.', ephemeral: true });
        }

        try {
            await channel.setRateLimitPerUser(seconds);
            
            if (seconds === 0) {
                await interaction.editReply(`✅ Slowmode has been **disabled** in ${channel}`);
                await sendModLog(interaction.guild, 'slowmode', interaction.user, `#${channel.name}`, 'Disabled slowmode', { '📍 Channel': channel.toString() });
            } else {
                const formatted = seconds < 60 ? `${seconds} seconds` : 
                                 seconds < 3600 ? `${Math.floor(seconds / 60)} minutes` : 
                                 `${Math.floor(seconds / 3600)} hours`;
                await interaction.editReply(`✅ Slowmode set to **${formatted}** in ${channel}`);
                await sendModLog(interaction.guild, 'slowmode', interaction.user, `#${channel.name}`, `Set slowmode to ${formatted}`, { '📍 Channel': channel.toString() });
            }
        } catch (error) {
            console.error('Error setting slowmode:', error);
            await interaction.editReply({ content: '❌ Failed to set slowmode. Make sure I have Manage Channels permission.', ephemeral: true });
        }
    }
};