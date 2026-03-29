const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbotavatar')
        .setDescription('Set a custom bot avatar for this server')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to use as the bot avatar in this server')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: '❌ This command can only be used in a server.', ephemeral: true });
            return;
        }

        // Only guild owner or bot owner can use this command
        const BOT_OWNER_ID = '1124168034332975204';
        if (interaction.user.id !== interaction.guild.ownerId && interaction.user.id !== BOT_OWNER_ID) {
            await interaction.editReply({ content: '❌ Only the server owner or bot owner can customize the bot.', ephemeral: true });
            return;
        }

        const attachment = interaction.options.getAttachment('image');

        // Validate image
        if (!attachment.contentType || !attachment.contentType.startsWith('image/')) {
            await interaction.editReply({ content: '❌ Please provide a valid image file (PNG, JPG, or GIF).', ephemeral: true });
            return;
        }

        // Check file size (Discord limit is 10MB for guild avatars)
        if (attachment.size > 10 * 1024 * 1024) {
            await interaction.editReply({ content: '❌ Image file is too large. Maximum size is 10MB.', ephemeral: true });
            return;
        }

        try {
            const botMember = await interaction.guild.members.fetchMe();
            
            // Set guild-specific avatar
            await botMember.setAvatar(attachment.url);
            
            await interaction.editReply({ 
                content: '✅ Bot avatar has been updated for this server!',
                files: [attachment]
            });
        } catch (error) {
            console.error('Error setting bot avatar:', error);
            
            if (error.code === 50013) {
                await interaction.editReply({ content: '❌ I don\'t have permission to change my avatar in this server.', ephemeral: true });
            } else if (error.message.includes('rate limit')) {
                await interaction.editReply({ content: '❌ Avatar changes are rate-limited. Please try again in a few minutes.', ephemeral: true });
            } else {
                await interaction.editReply({ content: '❌ Failed to set bot avatar. The image might be invalid or Discord\'s API might be experiencing issues.', ephemeral: true });
            }
        }
    }
};
