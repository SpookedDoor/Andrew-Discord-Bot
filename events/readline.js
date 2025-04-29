const { channelMap } = require('../config.json');
const readline = require('readline');
const ready = require('./ready.js');

module.exports = (client) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let targetGuildId = Object.keys(channelMap)[0];
    let targetChannelId = channelMap[targetGuildId];

    const getGuildName = (guildId) => {
        const guild = client.guilds.cache.get(guildId);
        return guild ? guild.name : `Unknown Guild (${guildId})`;
    };

    const getChannelName = (guildId, channelId) => {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return `Unknown Channel (${channelId})`;
        const channel = guild.channels.cache.get(channelId);
        return channel ? channel.name : `Unknown Channel (${channelId})`;
    };

    console.log(`Default target set to Guild ID: ${targetGuildId}, Channel ID: ${targetChannelId}`);
    console.log('Commands:');
    console.log('  /setguild <GUILD_ID> - Set the target guild');
    console.log('  /setchannel <CHANNEL_ID> - Set the target channel within the current guild');
    console.log('  /send <MESSAGE> - Send a message to the target guild\'s channel');
    console.log('  /randomtime - Check when the next random message will be sent');
    console.log('  /help - Shows all available terminal commands');
    console.log('  /exit - Exit the terminal interface');

    rl.on('line', async (input) => {
        const args = input.trim().split(' ');
        const command = args[0];

        if (command === '/setguild') {
            const guildId = args[1];
            if (channelMap[guildId]) {
                targetGuildId = guildId;
                targetChannelId = channelMap[guildId];
                console.log(`Target guild set to Guild: ${getGuildName(targetGuildId)}, Channel: ${getChannelName(targetGuildId, targetChannelId)}`);
            } else {
                console.log(`Guild ID ${guildId} not found in channelMap.`);
            }
        } else if (command === '/setchannel') {
            const channelId = args[1];
            if (!channelId) {
                console.log('Please provide a channel ID.');
                return;
            }

            const guild = client.guilds.cache.get(targetGuildId);
            if (!guild) {
                console.log(`Guild not found for Guild ID: ${targetGuildId}.`);
                return;
            }

            const channel = guild.channels.cache.get(channelId);
            if (!channel) {
                console.log(`Channel ID ${channelId} not found in Guild: ${getGuildName(targetGuildId)}.`);
                return;
            }

            targetChannelId = channelId;
            console.log(`Target channel set to Channel: ${getChannelName(targetGuildId, targetChannelId)} in Guild: ${getGuildName(targetGuildId)}`);
        } else if (command === '/send') {
            const message = args.slice(1).join(' ');
            if (!message) {
                console.log('Please provide a message to send.');
                return;
            }

            const channel = client.channels.cache.get(targetChannelId);
            if (!channel) {
                console.log(`Channel not found for Guild: ${getGuildName(targetGuildId)}.`);
                return;
            }

            try {
                await channel.send(message);
                console.log(`Message sent to Guild: ${getGuildName(targetGuildId)}, Channel: ${getChannelName(targetGuildId, targetChannelId)}`);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else if (command === '/randomtime') {
            const minutes = Math.floor((ready.getNextMessageTimestamp() - Date.now()) / 60000);
            const seconds = Math.floor((ready.getNextMessageTimestamp() - Date.now()) / 1000) % 60;
            console.log(`Next message will be sent in ${minutes}m ${seconds}s.`);
            return;
        } else if (command === '/help') {
            console.log(`Available commands: /setguild, /send, /exit, /randomtime`);
            return;
        } else if (command === '/exit') {
            console.log('Exiting terminal interface...');
            rl.close();
        } else {
            console.log('Unknown command. Available commands: /setguild, /send, /exit, /randomtime');
        }
    });
};