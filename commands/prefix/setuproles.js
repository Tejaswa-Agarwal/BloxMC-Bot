const configStore = require('../../configStore');

module.exports = {
    name: 'setuproles',
    description: 'Configure moderator and admin roles for the bot',
    usage: 'setuproles <@moderator_role> <@admin_role>',
    async execute(message, args) {
        if (!message.guild) {
            message.channel.send('This command can only be used in a server.');
            return;
        }

        // Only guild owner or bot owner can use this command
        const BOT_OWNER_ID = '1124168034332975204';
        if (message.author.id !== message.guild.ownerId && message.author.id !== BOT_OWNER_ID) {
            message.channel.send('❌ Only the server owner or bot owner can configure roles.');
            return;
        }

        if (args.length < 2) {
            message.channel.send('❌ Please mention both roles: `k!setuproles @ModRole @AdminRole`');
            return;
        }

        // Parse role mentions
        const modRoleId = args[0].replace(/[<@&>]/g, '');
        const adminRoleId = args[1].replace(/[<@&>]/g, '');

        const modRole = message.guild.roles.cache.get(modRoleId);
        const adminRole = message.guild.roles.cache.get(adminRoleId);

        if (!modRole || !adminRole) {
            message.channel.send('❌ Could not find one or both roles. Please mention valid roles.');
            return;
        }

        // Store roles in config per guild
        const guildId = message.guild.id;
        const roleConfig = configStore.get('roleConfig') || {};
        
        if (!roleConfig[guildId]) {
            roleConfig[guildId] = {};
        }
        
        roleConfig[guildId].moderatorRoleId = modRole.id;
        roleConfig[guildId].adminRoleId = adminRole.id;
        
        configStore.set('roleConfig', roleConfig);

        message.channel.send(
            `✅ **Role Configuration Updated**\n\n` +
            `**Moderator Role:** ${modRole}\n` +
            `**Admin Role:** ${adminRole}\n\n` +
            `*Note: Server owner and bot owner always have access to all commands.*`
        );
    }
};
