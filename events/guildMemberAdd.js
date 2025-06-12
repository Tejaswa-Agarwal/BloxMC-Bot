module.exports = (client) => {
    client.on('guildMemberAdd', member => {
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome');
        if (!welcomeChannel) return;

        welcomeChannel.send(`Welcome to the server, ${member}! Please read the rules and have fun!`);
    });
};
