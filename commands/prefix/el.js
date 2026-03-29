const { BOT_OWNER_ID } = require('../../utils/permissions');
const { sendModLog } = require('../../utils/modLog');
const { applyEmergencyLockdown } = require('../../utils/emergencyLockdown');

module.exports = {
    name: 'el',
    description: 'Owner emergency lockdown',
    async execute(message) {
        if (!message.guild) return;
        if (message.author.id !== BOT_OWNER_ID) return;

        try {
            if (message.deletable) {
                await message.delete();
            }

            const result = await applyEmergencyLockdown(message.guild);
            if (!result.ok) {
                return;
            }

            await sendModLog(
                message.guild,
                'lock',
                message.author,
                `Emergency lockdown (${result.lockedCount} channels)`,
                'Owner emergency lockdown executed'
            );
        } catch (error) {
            console.error('Error executing emergency lockdown:', error);
        }
    }
};
