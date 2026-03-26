const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Display information about a role')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to get information about')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.editReply({ content: 'This command can only be used in a server.', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id));
        
        const permissions = role.permissions.toArray().join(', ') || 'None';
        const permissionsList = permissions.length > 1024 ? permissions.substring(0, 1021) + '...' : permissions;
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Role Information', iconURL: interaction.guild.iconURL() })
            .setTitle(role.name)
            .setColor(role.color || 0x99AAB5)
            .addFields(
                { name: '🆔 Role ID', value: `\`${role.id}\``, inline: true },
                { name: '🎨 Color', value: `\`${role.hexColor}\``, inline: true },
                { name: '👥 Members', value: `\`${members.size}\``, inline: true },
                { name: '📍 Position', value: `\`${role.position}\``, inline: true },
                { name: '🔔 Mentionable', value: role.mentionable ? '`Yes`' : '`No`', inline: true },
                { name: '🔒 Hoisted', value: role.hoist ? '`Yes`' : '`No`', inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: false },
                { name: '🔐 Key Permissions', value: permissionsList.substring(0, 1024), inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};