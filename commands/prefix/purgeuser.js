const { Permissions } = require('discord.js');

module.exports = {
    name: 'purgeuser',
    description: 'Delete a number of messages from a specific user in the channel',
    usage: '!purgeuser <@user> <amount>',
    async execute(message, args) {
        if (!message.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
            return message.reply('You do not have permission to use this command.');
        }

        if (args.length < 2) {
            return message.reply('Usage: !purgeuser <@user> <amount>');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a valid user.');
        }

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Please provide a valid number between 1 and 100.');
        }

        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(m => m.author.id === user.id).first(amount);

            if (userMessages.length === 0) {
                return message.reply('No messages found from that user in the last 100 messages.');
            }

            await message.channel.bulkDelete(userMessages, true);
            message.reply(`Successfully deleted ${userMessages.length} messages from ${user.tag}.`);
        } catch (error) {
            console.error('Error deleting user messages:', error);
            message.reply('There was an error trying to delete messages in this channel.');
        }
    }
};
