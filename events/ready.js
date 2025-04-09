const { Events } = require("discord.js");
const { channelMap } = require("../config.json");
const status = require('../setSleep.js');
const { possibleMessages, possibleMessages2, possibleMessages3, possibleMessages4 } = require('../messageDatabase.js');

function checkSleepSchedule() {
	const now = new Date();
	const hourUTC = now.getUTCHours();

	if (hourUTC >= 2 && hourUTC < 12) {
		if (!status.isAsleep) {
			console.log('Auto-sleeping Androo');
			status.setAsleep(true);
		}
	}
	else {
		if (status.isAsleep && !status.override	) {
			console.log('Auto-waking Androo');
			status.setAsleep(false);
		}
	}
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const allMessages = possibleMessages.concat(possibleMessages2, possibleMessages3, possibleMessages4);

        const sendRandomMessage = async () => {
            for (const [guildId, channelId] of Object.entries(channelMap)) {
                const channel = client.channels.cache.get(channelId);
                
                if (!channel) {
                    console.log(`Channel not found for guild ID: ${guildId}`);
                    continue;
                }
    
				try {
					if (!status.isAsleep) {
						const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];
						
						if (possibleMessages2.includes(randomMessage)) {
							await channel.send(possibleMessages2[0]);
							await channel.send(possibleMessages2[1]);
							console.log(`Both messages from possibleMessages2 sent to guild ID: ${guildId}`);
						} 
						else if (possibleMessages3.includes(randomMessage)) {
							await channel.send(possibleMessages3[0]);
							await channel.send(possibleMessages3[1]);
							console.log(`Both messages from possibleMessages3 sent to guild ID: ${guildId}`);

            }
              else if (possibleMessages4.includes(randomMessage)) {
              await channel.send(possibleMessages4[0]);
              await channel.send(possibleMessages4[1]);
              console.log(`Both messages from possibleMessages4 sent to guild ID: ${guildId}`);
						}
						else {
							await channel.send(randomMessage);
							console.log(`Random message sent to guild ID: ${guildId}`);
            }
          }
          else {
              console.error('Random message is undefined or null!');
					}
				} catch (error) {
					console.error(`Error sending message to guild ID: ${guildId}`, error);
				}
    		}
			scheduleRandomMessage();
        };

        const scheduleRandomMessage = () => {
			if (!status.isAsleep) {
				const randomDelay = Math.floor(Math.random() * (3600000 - 1800000 + 1)) + 1800000;
				console.log(`Next message will be sent in ${Math.round(randomDelay / 60000)} minutes.`);
				setTimeout(sendRandomMessage, randomDelay);
			}
        };

		scheduleRandomMessage();

		setInterval(checkSleepSchedule, 60 * 1000);
    },
};