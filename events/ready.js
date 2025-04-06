const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		
		const sendRandomMessage = async () => {
			for (const [guildId, channelId] of Object.entries(channelMap)) {
				const channel = client.channels.cache.get(channelId);
		
				if (!channel) {
					console.log(`Channel not found for guild ID: ${guildId}`);
					continue;
				}
		
				try {
					await channel.send('<:tomoko_cup:1358095740299116614>');
					console.log(`Random message sent to guild ID: ${guildId}`);
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
	},
};