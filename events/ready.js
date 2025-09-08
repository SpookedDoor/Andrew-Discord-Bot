const { Events, ActivityType } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getMessages, getRandomMessage } = require('../messageDatabase.js');
const db = require('../db.js');

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
					const batchCategories = await db.query("SELECT name FROM message_categories WHERE name LIKE 'batch%'");
					const batchCategoryNames = batchCategories.rows.map(r => r.name);
					const category = Math.random() < 0.8 ? 'general' : 'batch';

					if (category === 'general') {
						const msg = await getRandomMessage(category);
						if (msg.files.length > 0) console.log(`Random message with attachment from ${category} sent to guild: ${guild.name}`);
						else console.log(`Random message from ${category} sent to guild: ${guild.name}`);
						await channel.send(msg);
					} else if (category === 'batch') {
						const category = batchCategoryNames[Math.floor(Math.random() * batchCategoryNames.length)];
						const msgs = await getMessages(category);
						for (const m of msgs) await channel.send(m);
						console.log(`Batch of ${msgs.length} messages from ${category} sent to guild: ${guild.name}`);
					}
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