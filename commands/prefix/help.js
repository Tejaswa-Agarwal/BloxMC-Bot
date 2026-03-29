const { buildHelpOverviewEmbed, buildHelpSelectRow } = require('../../utils/helpMenu');

module.exports = {
    name: 'help',
    description: 'Display all available commands',
    async execute(message, args) {
        const embed = buildHelpOverviewEmbed(message.client);
        const row = buildHelpSelectRow('overview');
        message.channel.send({ embeds: [embed], components: [row] });
    }
};
