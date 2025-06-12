const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a number of messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            await interaction.editReply({ content: 'You do not have permission to use this command.' });
            return;
        }

        const amount = interaction.options.getInteger('amount');
        if (!amount || amount < 1 || amount > 100) {
            await interaction.editReply({ content: 'Please provide a valid number between 1 and 100.' });
            return;
        }

        try {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.editReply({ content: `Successfully deleted ${amount} messages.` });
        } catch (error) {
            console.error('Error deleting messages:', error);
            await interaction.editReply({ content: 'There was an error trying to delete messages in this channel.' });
        }
    }
};
