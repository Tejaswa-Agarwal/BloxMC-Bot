const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custommessage')
        .setDescription('Send a custom message to a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
    async execute(interaction) {
if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
}

        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({ content: 'Please specify a valid text channel.', ephemeral: true });
        }

        await channel.send(message);
        await interaction.reply({ content: 'Message sent successfully.', ephemeral: true });
    }
};
