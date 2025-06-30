const { Events } = require("discord.js");
const { channelMap } = require("../config.json");
const status = require('../setSleep.js');
const { possibleMessages, possibleMessages2, possibleMessages3, possibleMessages4, possibleMessages5, possibleMessages6, 
	possibleMessages7, possibleMessages8, possibleMessages9, possibleMessages10, wakeytime, sleepytime } = require('../messageDatabase.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const allMessages = possibleMessages.concat(possibleMessages2, possibleMessages3, possibleMessages4, possibleMessages5, 
			possibleMessages6, possibleMessages7, possibleMessages8, possibleMessages9, possibleMessages10);

		const messageGroups = [
			possibleMessages2,
			possibleMessages3,
			possibleMessages4,
			possibleMessages5,
			possibleMessages6,
			possibleMessages7,
			possibleMessages8,
			possibleMessages9,
			possibleMessages10,
		];

        const sendRandomMessage = async () => {
            for (const [guildId, channelId] of Object.entries(channelMap)) {
                const channel = client.channels.cache.get(channelId);
                
                if (!channel) {
                    console.log(`Channel not found for guild ID: ${guildId}`);
                    continue;
                }
    
				try {
					if (!status.getSleepStatus(guildId)) {
						const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];
						const group = messageGroups.find(arr => arr.includes(randomMessage));

						if (group) {
							const groupIndex = messageGroups.indexOf(group) + 2;
							for (const msg of group) await channel.send(msg);
							console.log(`All messages from possibleMessages${groupIndex} sent to guild: ${client.guilds.cache.get(guildId).name}`);
						} else {
							await channel.send(randomMessage);
							console.log(`Random message sent to guild: ${client.guilds.cache.get(guildId).name}`);
						}
					}
				} catch (error) {
					console.error(`Error sending message to guild: ${client.guilds.cache.get(guildId).name}`, error);
				}
    		}
			scheduleRandomMessage();
        };
		
        const scheduleRandomMessage = () => {
			if (!status.getSleepStatus(client.guilds.cache.first().id)) {
				const randomMinutes = Math.floor(Math.random() * (360 - 180 + 1)) + 180;
				const randomDelay = randomMinutes * 60 * 1000;
				const nextMessageTimestamp = Date.now() + randomDelay;
				module.exports.getNextMessageTimestamp = () => nextMessageTimestamp;
				console.log(`Next message will be sent in ${Math.round(randomDelay / 60000)} minutes.`);
				setTimeout(sendRandomMessage, randomDelay);
			}
        };

		const checkSleepSchedule = async () => {
			const now = new Date();
			const hourUTC = now.getUTCHours();
			const minutes = now.getUTCMinutes();
			
			for (const [guildId, channelId] of Object.entries(channelMap)) {
				const channel = client.channels.cache.get(channelId);
				
				if (hourUTC === 12 && minutes === 0 && status.getOverride(guildId)) {
					status.clearOverride(guildId);
					console.log(`Cleared manual override for guild: ${client.guilds.cache.get(guildId).name}`);
				}

				if (hourUTC >= 2 && hourUTC < 12) {
					if (!status.getSleepStatus(guildId) && !status.getWakeOverride(guildId)) {
						console.log(`Auto-sleeping Androo in guild: ${client.guilds.cache.get(guildId).name}`);
						if (hourUTC === 2 && minutes === 0) await channel.send(sleepytime[Math.floor(Math.random() * sleepytime.length)]);
						status.setSleepStatus(guildId, true);	
					}
				} else {
					if (status.getSleepStatus(guildId) && !status.getOverride(guildId)) {
						console.log(`Auto-waking Androo in guild: ${client.guilds.cache.get(guildId).name}`);
						await channel.send(wakeytime[Math.floor(Math.random() * wakeytime.length)]);
						status.setSleepStatus(guildId, false);
					}
				}
			}
		}

		scheduleRandomMessage();
		setInterval(checkSleepSchedule, 60 * 1000);
    },
};