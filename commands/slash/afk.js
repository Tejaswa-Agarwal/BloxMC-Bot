const { SlashCommandBuilder } = require('discord.js');
const EmbedTemplate = require('../../utils/embedTemplate');
const { setAFK } = require('../../utils/afk');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for being AFK')
                .setRequired(false)
                .setMaxLength(200)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'AFK';
        
        setAFK(interaction.user.id, reason, Date.now());

        const embed = EmbedTemplate.success(
            '💤 AFK Status Set',
            `You are now AFK: **${reason}**\n\nYour AFK status will be removed when you send a message.`
        );

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    }
};
