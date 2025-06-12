const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway in the channel')
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the giveaway in minutes')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Prize for the giveaway')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to run the giveaway in')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('requirementrole')
                .setDescription('Role required to enter the giveaway')
                .setRequired(false)),
    async execute(interaction) {
        const duration = interaction.options.getInteger('duration');
        const prize = interaction.options.getString('prize');
        const channel = interaction.options.getChannel('channel');
        const requirementRole = interaction.options.getRole('requirementrole');

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaway! 🎉')
            .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nDuration: ${duration} minute(s)${requirementRole ? `\nRequirement Role: ${requirementRole.name}` : ''}`)
            .setColor('Blue')
            .setTimestamp(Date.now() + duration * 60000)
            .setFooter({ text: 'Giveaway ends' });

        const giveawayMessage = await channel.send({ embeds: [embed] });
        await giveawayMessage.react('🎉');

        setTimeout(async () => {
            try {
                const fetchedMessage = await channel.messages.fetch(giveawayMessage.id);
                const reaction = fetchedMessage.reactions.cache.get('🎉');

                if (!reaction) {
                    await channel.send('No one entered the giveaway.');
                    return;
                }

                const users = await reaction.users.fetch();
                let entrants = users.filter(u => !u.bot).map(u => u);

                if (requirementRole) {
                    entrants = entrants.filter(user => {
                        const member = interaction.guild.members.cache.get(user.id);
                        return member && member.roles.cache.has(requirementRole.id);
                    });
                }

                if (entrants.length === 0) {
                    await channel.send('No valid entries for the giveaway.');
                    return;
                }

                const winner = entrants[Math.floor(Math.random() * entrants.length)];
                await channel.send(`🎉 Congratulations ${winner}! You won the giveaway for **${prize}**!`);
            } catch (error) {
                console.error('Error in giveaway timeout:', error);
            }
        }, duration * 60000);

        try {
            await interaction.editReply({ content: 'Giveaway started!' });
        } catch (error) {
            console.error('Error sending initial reply:', error);
        }
    }
};
