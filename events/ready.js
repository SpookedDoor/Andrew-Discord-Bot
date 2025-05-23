const { Events } = require("discord.js");
const { channelMap } = require("../config.json");
const status = require('../setSleep.js');
const { possibleMessages, possibleMessages2, possibleMessages3, possibleMessages4, possibleMessages5, wakeytime, sleepytime } = require('../messageDatabase.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const allMessages = possibleMessages.concat(possibleMessages2, possibleMessages3, possibleMessages4, possibleMessages5);

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
						
						if (possibleMessages2.includes(randomMessage)) {
							await channel.send(possibleMessages2[0]);
							await channel.send(possibleMessages2[1]);
							console.log(`Both messages from possibleMessages2 sent to guild: ${client.guilds.cache.get(guildId).name}`);
						} 
						else if (possibleMessages3.includes(randomMessage)) {
							await channel.send(possibleMessages3[0]);
							await channel.send(possibleMessages3[1]);
							console.log(`Both messages from possibleMessages3 sent to guild: ${client.guilds.cache.get(guildId).name}`);
						}
						else if (possibleMessages4.includes(randomMessage)) {
							await channel.send(possibleMessages4[0]);
							await channel.send(possibleMessages4[1]);
							console.log(`Both messages from possibleMessages4 sent to guild: ${client.guilds.cache.get(guildId).name}`);
						}
						else if (possibleMessages5.includes(randomMessage)) {
							await channel.send(possibleMessages5[0]);
							await channel.send(possibleMessages5[1]);
							console.log(`Both messages from possibleMessages5 sent to guild: ${client.guilds.cache.get(guildId).name}`);
						}
						else {
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
				if (hourUTC >= 2 && hourUTC < 12) {
					if (!status.getSleepStatus(guildId) && !status.getWakeOverride(guildId)) {
						console.log(`Auto-sleeping Androo in guild: ${client.guilds.cache.get(guildId).name}`);
						if (hourUTC === 2 && minutes === 0) await channel.send(sleepytime[Math.floor(Math.random() * sleepytime.length)]);
						status.setSleepStatus(guildId, true);	
					}
				}
				else {
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