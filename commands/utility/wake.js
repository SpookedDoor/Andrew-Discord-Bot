const { SlashCommandBuilder } = require('discord.js');
const status = require('../../setSleep.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wake')
		.setDescription('Wake Androo up'),
	async execute(interaction) {
		status.setAsleep(false);
		status.setOverride(false);
		await interaction.reply('morning all i am Griffith');
	},
};
