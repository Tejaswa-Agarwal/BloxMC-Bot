const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const configStore = require('../../configStore');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuproles')
        .setDescription('Configure moderator and admin roles for the bot')
        .addRoleOption(option =>
            option.setName('moderator')
                .setDescription('Role that can use moderation commands')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('admin')
                .setDescription('Role that can use admin commands')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        // Only guild owner or bot owner can use this command
        const BOT_OWNER_ID = '1124168034332975204';
        if (interaction.user.id !== interaction.guild.ownerId && interaction.user.id !== BOT_OWNER_ID) {
            await interaction.editReply({ content: '❌ Only the server owner or bot owner can configure roles.', ephemeral: true });
            return;
        }

        const modRole = interaction.options.getRole('moderator');
        const adminRole = interaction.options.getRole('admin');

        // Store roles in config per guild
        const guildId = interaction.guild.id;
        const roleConfig = configStore.get('roleConfig') || {};
        
        if (!roleConfig[guildId]) {
            roleConfig[guildId] = {};
        }
        
        roleConfig[guildId].moderatorRoleId = modRole.id;
        roleConfig[guildId].adminRoleId = adminRole.id;
        
        configStore.set('roleConfig', roleConfig);

        await interaction.editReply({ 
            content: `✅ **Role Configuration Updated**\n\n` +
                    `**Moderator Role:** ${modRole}\n` +
                    `**Admin Role:** ${adminRole}\n\n` +
                    `*Note: Server owner and bot owner always have access to all commands.*`
        });
    }
};
