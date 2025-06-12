const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedmessage')
        .setDescription('Send an embed message to a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the embed to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Color of the embed in hex (e.g. #0099ff)')
                .setRequired(false)),
    async execute(interaction) {
if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
}

        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || '#0099ff';

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({ content: 'Please specify a valid text channel.', ephemeral: true });
        }

const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description);

try {
    embed.setColor(color);
} catch (error) {
    embed.setColor('#0099ff'); // fallback color if invalid
}

try {
    await channel.send({ embeds: [embed] });
    try {
        await interaction.reply({ content: 'Embed message sent successfully.', ephemeral: true });
    } catch (error) {
        console.error('Error sending initial reply:', error);
    }
} catch (error) {
    console.error('Error sending embed message:', error);
    if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
    }
}
    }
};
