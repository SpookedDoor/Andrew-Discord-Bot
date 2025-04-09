const { SlashCommandBuilder } = require('discord.js');
const { kanye_messages } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kanye')
		.setDescription('Glaze Kanye!'),
	async execute(interaction) {
		await interaction.reply(kanye_messages[Math.floor(Math.random() * kanye_messages.length)]);
	},
};