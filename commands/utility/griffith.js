const { SlashCommandBuilder } = require('discord.js');
const { griffith_messages } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('griffith')
		.setDescription('Androo think he Griffith'),
	async execute(interaction) {
		await interaction.reply(griffith_messages[Math.floor(Math.random() * griffith_messages.length)]);
	},
};