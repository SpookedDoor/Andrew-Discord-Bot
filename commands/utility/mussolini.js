const { SlashCommandBuilder } = require('discord.js');
const { mussolini_messages } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mussolini')
		.setDescription('Glaze Mussolini!'),
	async execute(interaction) {
		await interaction.reply(mussolini_messages[Math.floor(Math.random() * mussolini_messages.length)]);
	},
};