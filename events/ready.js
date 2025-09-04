const { Events, ActivityType } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const db = require('../db.js');
const { general, batch, batch2, batch3, batch4, batch5, 
	batch6, batch7, batch8, batch9, batch10, batch11, 
	batch12, batch13, batch14 } = require('../messageDatabase.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

		const activities = [
            { name: 'Watamote movie', type: ActivityType.Watching },
            { name: 'Kanye West', type: ActivityType.Listening },
            { name: 'Thick of It', type: ActivityType.Listening },
			{ name: 'cousins', type: ActivityType.Listening },
            { name: 'with kids', type: ActivityType.Playing }
        ];

        let currentActivityIndex = 0;

        const updateActivity = () => {
            const activity = activities[currentActivityIndex];
            client.user.setActivity(activity.name, { type: activity.type });
            currentActivityIndex = (currentActivityIndex + 1) % activities.length;
        };

        updateActivity();
        setInterval(updateActivity, 3 * 60 * 60 * 1000);

		const updateAvatar = async () => {
			const andrew = await client.users.fetch('1014404029146726460');
			const avatarURL = andrew.displayAvatarURL({ size: 1024, dynamic: true });
			const response = await fetch(avatarURL);
			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			client.user.setAvatar(buffer);
		};

		updateAvatar();
		setInterval(updateAvatar, 24 * 60 * 60 * 1000);

        const allMessages = general.concat(batch, batch2, batch3, batch4, 
			batch5, batch6, batch7, batch8, batch9, batch10, 
            batch11, batch12, batch13);

		const messageGroups = [
			batch,
			batch2,
			batch3,
			batch4,
			batch5,
			batch6,
			batch7,
			batch8,
			batch9,
			batch10,
			batch11,
			batch12,
			batch13
		];

        const sendRandomMessage = async () => {
			const res = await db.query('SELECT id FROM disabled_guilds');
			const disabledGuilds = res.rows.map(row => row.id);

            for (const guild of client.guilds.cache.values()) {
				if (disabledGuilds.includes(guild.id)) {
					console.log(`Skipping guild: ${guild.name}`);
					continue;
				}

				const res = await db.query('SELECT channel_id FROM default_channels WHERE guild_id = $1', [guild.id]);
				let channel;

				if (res.rowCount > 0) channel = guild.channels.cache.get(res.rows[0].channel_id);
				if (!channel) channel = guild.channels.cache.find(ch => ch.type === 0);
    
				try {
					const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];
					const group = messageGroups.find(arr => arr.includes(randomMessage));

					if (group) {
						const groupIndex = messageGroups.indexOf(group) + 2;
						for (const msg of group) await channel.send(msg);
                        console.log(`All messages from general${groupIndex} sent to guild: ${guild.name}`);
					} else {
						await channel.send(randomMessage);
                        console.log(`Random message sent to guild: ${guild.name}`);
					}
				} catch (error) {
                    console.error(`Error sending message to guild: ${guild.name}`, error);
				}
    		}
			scheduleRandomMessage();
        };
		
        const scheduleRandomMessage = () => {
			const randomMinutes = Math.floor(Math.random() * (360 - 180 + 1)) + 180;
			const randomDelay = randomMinutes * 60 * 1000;
			const nextMessageTimestamp = Date.now() + randomDelay;
			module.exports.getNextMessageTimestamp = () => nextMessageTimestamp;
			console.log(`Next message will be sent in ${Math.round(randomDelay / 60000)} minutes.`);
			setTimeout(sendRandomMessage, randomDelay);
        };
		scheduleRandomMessage();
    },
};