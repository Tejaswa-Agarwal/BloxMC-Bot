module.exports = {
    name: 'setbotavatar',
    description: 'Set a custom bot avatar for this server',
    usage: 'setbotavatar (attach an image)',
    async execute(message, args) {
        if (!message.guild) {
            message.channel.send('❌ This command can only be used in a server.');
            return;
        }

        // Only guild owner or bot owner can use this command
        const BOT_OWNER_ID = '1124168034332975204';
        if (message.author.id !== message.guild.ownerId && message.author.id !== BOT_OWNER_ID) {
            message.channel.send('❌ Only the server owner or bot owner can customize the bot.');
            return;
        }

        // Check for attachment
        if (message.attachments.size === 0) {
            message.channel.send('❌ Please attach an image file with the command.');
            return;
        }

        const attachment = message.attachments.first();

        // Validate image
        if (!attachment.contentType || !attachment.contentType.startsWith('image/')) {
            message.channel.send('❌ Please provide a valid image file (PNG, JPG, or GIF).');
            return;
        }

        // Check file size (Discord limit is 10MB for guild avatars)
        if (attachment.size > 10 * 1024 * 1024) {
            message.channel.send('❌ Image file is too large. Maximum size is 10MB.');
            return;
        }

        try {
            const botMember = await message.guild.members.fetchMe();
            
            // Set guild-specific avatar
            await botMember.setAvatar(attachment.url);
            
            message.channel.send('✅ Bot avatar has been updated for this server!');
        } catch (error) {
            console.error('Error setting bot avatar:', error);
            
            if (error.code === 50013) {
                message.channel.send('❌ I don\'t have permission to change my avatar in this server.');
            } else if (error.message.includes('rate limit')) {
                message.channel.send('❌ Avatar changes are rate-limited. Please try again in a few minutes.');
            } else {
                message.channel.send('❌ Failed to set bot avatar. The image might be invalid or Discord\'s API might be experiencing issues.');
            }
        }
    }
};
