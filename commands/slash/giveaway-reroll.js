const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway-reroll')
        .setDescription('Reroll a giveaway to pick a new winner')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The message ID of the giveaway')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const messageId = interaction.options.getString('messageid');
        const channel = interaction.channel;

        try {
            const giveawayMessage = await channel.messages.fetch(messageId);
            if (!giveawayMessage) {
                await interaction.editReply('Giveaway message not found.');
                return;
            }

            const reaction = giveawayMessage.reactions.cache.get('🎉');
            if (!reaction) {
                await interaction.editReply('No 🎉 reaction found on the giveaway message.');
                return;
            }

            const users = await reaction.users.fetch();
            let entrants = users.filter(u => !u.bot).map(u => u);

            if (entrants.length === 0) {
                await interaction.editReply('No valid entrants found for the giveaway.');
                return;
            }

            const winner = entrants[Math.floor(Math.random() * entrants.length)];
            await channel.send(`🎉 Congratulations ${winner}! You won the reroll for the giveaway!`);
            await interaction.editReply('Giveaway reroll completed successfully.');
        } catch (error) {
            console.error('Error rerolling giveaway:', error);
            await interaction.editReply('An error occurred while rerolling the giveaway.');
        }
    }
};
