const { Events } = require("discord.js");
const { channelMap } = require("../config.json");
const status = require('../setSleep.js');

function checkSleepSchedule() {
		const now = new Date();
		const hourUTC = now.getUTCHours();

		if (hourUTC >= 2 && hourUTC < 12) {
					if (!status.isAsleep) {
									console.log('Auto-sleeping Androo');
									status.setAsleep(true);
								}
				} else {
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

        const possibleMessages = [
            "<:tomoko_cup:1358095740299116614>",
            "Hello watafriends",
            "https://tenor.com/view/larsandtherealgirl-trailer-ryangosling-newgirlfriend-doll-gif-3525692",
            "https://tenor.com/view/republican-gif-24490147",
            "https://tenor.com/view/wesker-resident-evil-5-the-mastermind-dead-by-daylight-project-w-gif-8481201659685876360",
            "https://tenor.com/view/griffith-berserk-haha-smile-griffith-gif-24652295",
            "https://tenor.com/view/mads-mikkelsen-smoking-gif-24232377",
            "From the the screen to the pen to the ring to the king",
            "https://tenor.com/view/dont-care-go-my-metal-sonic-metal-sonic-sonic-cd-knuckles-chaotix-go-metal-sonic-gif-5455408462557000696",
            "You are so based yeezy",
            "https://tenor.com/view/anime-berserk-griffith-necklace-off-gif-17645086",
            "Me whit tomoko doll",
            "I am prime Griffith",
            "<:cirnoarc:1358517895809990793>",
            "<:tomokoarc:1358500281956044991>",
            "<:depressed:1358517922938617883>",
            "https://tenor.com/view/minion-gooning-gym-smoking-nevergoon-gif-16345362028907877022",
            "She know that i am a bully",
            "She Wanna Hop in a rari",
            "Preacherman an rari are +SSS Tier songs",
            "Cope harder",
            "https://tenor.com/view/persona-persona3-minato-arisato-makoto-yuki-battle-gif-17813346",
            "-9999 watapoints",
            "average sonic fan ⬆️",
            "least schizo sonic fan",
            "lain red pill aura",
            "I want watamote movie someday",
            "https://tenor.com/view/touhou-cirno-pumped-excited-punch-gif-17552731",
            "https://tenor.com/view/tomoko-kuroki-gif-25980950",
            "Send csgo clips",
            "https://tenor.com/view/smoking-duck-dj-khaled-what-does-he-even-do-gif-8004262131450496811",
        ];

        const possibleMessages2 = [
            "I think i am kinda incel and blackpilled",
            "Sorry all",
        ];

        const possibleMessages3 = [
          "lain power: nuke",
          "https://tenor.com/view/serial-experiments-lain-lain-anime-smug-anime-smile-gif-14038034",
      ];

        const allMessages = possibleMessages.concat(possibleMessages2, possibleMessages3);

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
                  } else if (possibleMessages3.includes(randomMessage)) {
                    await channel.send(possibleMessages3[0]);
                    await channel.send(possibleMessages3[1]);
                    console.log(`Both messages from possibleMessages3 sent to guild ID: ${guildId}`);
                  } else {
                    await channel.send(randomMessage);
                    console.log(`Random message sent to guild ID: ${guildId}`);
                  }
		}
                } catch (error) {
                  console.error(`Error sending message to guild ID: ${guildId}`, error);
                }
            }

	scheduleRandomMessage();
        };

        const scheduleRandomMessage = () => {
            const randomDelay = Math.floor(Math.random() * (3600000 - 60000 + 1)) + 60000;
            console.log(`Next message will be sent in ${Math.round(randomDelay / 1000)} seconds.`);
            setTimeout(sendRandomMessage, randomDelay);
        };

	scheduleRandomMessage();

	setInterval(checkSleepSchedule, 60 * 1000);
    },
};
