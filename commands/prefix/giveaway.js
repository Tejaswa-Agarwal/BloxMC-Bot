const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'giveaway',
    description: 'Start a giveaway in the channel',
    usage: '!giveaway <duration_in_minutes> <prize> [#channel] [@role]',
    async execute(message, args) {
        if (args.length < 2) {
            message.channel.send('Usage: !giveaway <duration_in_minutes> <prize> [#channel] [@role]');
            return;
        }

        const duration = parseInt(args[0]);
        if (isNaN(duration) || duration <= 0) {
            message.channel.send('Please provide a valid duration in minutes.');
            return;
        }

        // Parse optional channel and role
        let channel = message.channel;
        let requirementRole = null;

        // Check if last arg is a role mention
        const lastArg = args[args.length - 1];
        const roleMatch = lastArg.match(/^<@&(\d+)>$/);
        if (roleMatch) {
            requirementRole = message.guild.roles.cache.get(roleMatch[1]);
            args.pop();
        }

        // Check if last arg is a channel mention
        const lastArg2 = args[args.length - 1];
        const channelMatch = lastArg2.match(/^<#(\d+)>$/);
        if (channelMatch) {
            const ch = message.guild.channels.cache.get(channelMatch[1]);
            if (ch) {
                channel = ch;
                args.pop();
            }
        }

        const prize = args.slice(1).join(' ');

        const embed = new MessageEmbed()
            .setTitle('🎉 Giveaway! 🎉')
            .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nDuration: ${duration} minute(s)${requirementRole ? `\nRequirement Role: ${requirementRole.name}` : ''}`)
            .setColor('BLUE')
            .setTimestamp(Date.now() + duration * 60000)
            .setFooter('Giveaway ends');

        const giveawayMessage = await channel.send({ embeds: [embed] });
        await giveawayMessage.react('🎉');

        setTimeout(async () => {
            const fetchedMessage = await channel.messages.fetch(giveawayMessage.id);
            const reaction = fetchedMessage.reactions.cache.get('🎉');

            if (!reaction) {
                channel.send('No one entered the giveaway.');
                return;
            }

            const users = await reaction.users.fetch();
            let entrants = users.filter(u => !u.bot).map(u => u);

            if (requirementRole) {
                entrants = entrants.filter(user => {
                    const member = message.guild.members.cache.get(user.id);
                    return member && member.roles.cache.has(requirementRole.id);
                });
            }

            if (entrants.length === 0) {
                channel.send('No valid entries for the giveaway.');
                return;
            }

            const winner = entrants[Math.floor(Math.random() * entrants.length)];
            channel.send(`🎉 Congratulations ${winner}! You won the giveaway for **${prize}**!`);
        }, duration * 60000);
    }
};
