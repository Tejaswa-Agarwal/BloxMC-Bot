const { SlashCommandBuilder, ChannelType } = require('discord.js');

const configStore = require('../../configStore');

let loggingChannelId = configStore.get('loggingChannelId') || null;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Set the channel to send command usage logs')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel to send logs to')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel || channel.type !== ChannelType.GuildText) {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Please select a valid text channel.', ephemeral: true });
            } else {
                await interaction.editReply({ content: 'Please select a valid text channel.', ephemeral: true });
            }
            return;
        }

        loggingChannelId = channel.id;
        configStore.set('loggingChannelId', loggingChannelId);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: `Command usage logs will be sent to ${channel}.`, ephemeral: true });
        } else {
            await interaction.editReply({ content: `Command usage logs will be sent to ${channel}.`, ephemeral: true });
        }
    },
    getLoggingChannelId() {
        return loggingChannelId;
    }
};
