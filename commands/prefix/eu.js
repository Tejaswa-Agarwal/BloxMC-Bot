const { BOT_OWNER_ID } = require('../../utils/permissions');
const { sendModLog } = require('../../utils/modLog');
const { liftEmergencyLockdown } = require('../../utils/emergencyLockdown');

module.exports = {
    name: 'eu',
    description: 'Owner emergency unlock',
    async execute(message) {
        if (!message.guild) return;
        if (message.author.id !== BOT_OWNER_ID) return;

        try {
            if (message.deletable) {
                await message.delete();
            }

            const result = await liftEmergencyLockdown(message.guild);
            if (!result.ok) {
                return;
            }

            await sendModLog(
                message.guild,
                'unlock',
                message.author,
                `Emergency unlock (${result.restoredCount} channels)`,
                'Owner emergency lockdown lifted'
            );
        } catch (error) {
            console.error('Error executing emergency unlock:', error);
        }
    }
};
