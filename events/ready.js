const { Events, ActivityType } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getRandomMessage } = require('../messageDatabase.js');
const db = require('../db.js');

const categories = [
    'general', 'batch', 'batch2', 'batch3', 'batch4', 'batch5', 'batch6', 'batch7', 
	'batch8', 'batch9', 'batch10', 'batch11', 'batch12', 'batch13', 'batch14'
];

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

		try {
			setInterval(updateAvatar, 24 * 60 * 60 * 1000);
		} catch (error) {
			console.error('Error updating avatar:', error);
		}

        const sendRandomMessage = async () => {
			const res = await db.query('SELECT id FROM disabled_guilds');
			const disabledGuilds = res.rows.map(r => r.id);

			for (const guild of client.guilds.cache.values()) {
				if (disabledGuilds.includes(guild.id)) continue;

				let channel;
				const res = await db.query('SELECT channel_id FROM default_channels WHERE guild_id = $1', [guild.id]);
				if (res.rowCount > 0) channel = guild.channels.cache.get(res.rows[0].channel_id);
				if (!channel) channel = guild.channels.cache.find(ch => ch.type === 0);

				try {
					const category = categories[Math.floor(Math.random() * categories.length)];
					const msg = await getRandomMessage(category);

					if (msg.files.length > 0) {
						console.log(`Random message with attachment from ${category} sent to guild: ${guild.name}`);
					}
					else {
						console.log(`Random message from ${category} sent to guild: ${guild.name}`);
					}
					
					await channel.send(msg);
				} catch (err) {
					console.error(`Error sending message to guild: ${guild.name}`, err);
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