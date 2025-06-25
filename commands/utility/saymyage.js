const { SlashCommandBuilder } = require('discord.js');
const { getAge } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('saymyage')
		.setDescription('Say my age'),
	async execute(interaction) {
		await interaction.reply(`I am ${getAge()}`);
	},
};