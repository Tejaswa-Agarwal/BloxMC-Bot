const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgeuser')
        .setDescription('Delete a number of messages from a specific user in the channel')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose messages to delete')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(m => m.author.id === user.id).first(amount);

            if (userMessages.length === 0) {
                return interaction.reply({ content: 'No messages found from that user in the last 100 messages.', ephemeral: true });
            }

            await interaction.channel.bulkDelete(userMessages, true);
            await interaction.reply({ content: `Successfully deleted ${userMessages.length} messages from ${user.tag}.`, ephemeral: true });
        } catch (error) {
            console.error('Error deleting user messages:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'There was an error trying to delete messages in this channel.', ephemeral: true });
            }
        }
    }
};
