const { SlashCommandBuilder } = require('discord.js');
const status = require('../../setSleep.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sleep')
		.setDescription('Make Androo sleep'),
	async execute(interaction) {
		status.setAsleep(true);
		await interaction.reply('GN all i am Griffith');
	},
};