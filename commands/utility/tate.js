const { SlashCommandBuilder } = require('discord.js');
const { tate_messages } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tate')
		.setDescription('Glaze Andrew Tate!'),
	async execute(interaction) {
		await interaction.reply(tate_messages[Math.floor(Math.random() * tate_messages.length)]);
	},
};