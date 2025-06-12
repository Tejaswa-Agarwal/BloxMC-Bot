const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Delete a number of messages from the channel',
    usage: '!purge <amount>',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('You do not have permission to use this command.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Please provide a valid number between 1 and 100.');
        }

        try {
            await message.channel.bulkDelete(amount, true);
            message.reply(`Successfully deleted ${amount} messages.`);
        } catch (error) {
            console.error('Error deleting messages:', error);
            message.reply('There was an error trying to delete messages in this channel.');
        }
    }
};
