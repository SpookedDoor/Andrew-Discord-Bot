const { SlashCommandBuilder } = require('discord.js');
const status = require('../../setSleep.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wake')
		.setDescription('CREATOR: Wake Androo up'),
	async execute(interaction) {
		try {
			if (gods.find(g => interaction.user.username === g.user)) {
				status.setAsleep(false);
				status.setOverride(false);
				await interaction.reply('morning all i am Griffith');
			}
			else {
				await interaction.reply({ content: "You are not authorised to use this command.", flags: MessageFlags.Ephemeral});
				return;
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "An error occurred while executing this command.", flags: MessageFlags.Ephemeral });
		}
	},
};
