const { SlashCommandBuilder } = require('discord.js');
const { ksi_messages } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ksi')
		.setDescription('Glaze KSI!'),
	async execute(interaction) {
		await interaction.reply(ksi_messages[Math.floor(Math.random() * ksi_messages.length)]);
	},
};