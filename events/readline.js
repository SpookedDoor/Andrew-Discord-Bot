const { channelMap } = require('../config.json');
const readline = require('readline');

module.exports = (client) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let targetGuildId = Object.keys(channelMap)[0];
    let targetChannelId = channelMap[targetGuildId];

    console.log(`Default target set to Guild ID: ${targetGuildId}, Channel ID: ${targetChannelId}`);
    console.log('Commands:');
    console.log('  /setguild <GUILD_ID> - Set the target guild');
    console.log('  /send <MESSAGE> - Send a message to the target guild\'s channel');
    console.log('  /exit - Exit the terminal interface');

    rl.on('line', async (input) => {
        const args = input.trim().split(' ');
        const command = args[0];

        if (command === '/setguild') {
            const guildId = args[1];
            if (channelMap[guildId]) {
                targetGuildId = guildId;
                targetChannelId = channelMap[guildId];
                console.log(`Target guild set to Guild ID: ${targetGuildId}, Channel ID: ${targetChannelId}`);
            } else {
                console.log(`Guild ID ${guildId} not found in channelMap.`);
            }
        } else if (command === '/send') {
            const message = args.slice(1).join(' ');
            if (!message) {
                console.log('Please provide a message to send.');
                return;
            }

            const channel = client.channels.cache.get(targetChannelId);
            if (!channel) {
                console.log(`Channel not found for Guild ID: ${targetGuildId}.`);
                return;
            }

            try {
                await channel.send(message);
                console.log(`Message sent to Guild ID: ${targetGuildId}, Channel ID: ${targetChannelId}: ${message}`);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else if (command === '/exit') {
            console.log('Exiting terminal interface...');
            rl.close();
        } else {
            console.log('Unknown command. Available commands: /setguild, /send, /exit');
        }
    });
};