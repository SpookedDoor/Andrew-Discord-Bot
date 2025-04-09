const { SlashCommandBuilder } = require('discord.js');
const { nick_messages } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fuentes')
		.setDescription('Glaze Nick Fuentes!'),
	async execute(interaction) {
		await interaction.reply(nick_messages[Math.floor(Math.random() * nick_messages.length)]);
	},
};