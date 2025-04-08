const { SlashCommandBuilder } = require('discord.js');
const status = require('../../setSleep.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Check if lil Androo is sleeping'),
	async execute(interaction) {
		await interaction.reply(`Lil Androo is currently ${status.isAsleep ? 'asleep' : 'awake'}`);
	},
};