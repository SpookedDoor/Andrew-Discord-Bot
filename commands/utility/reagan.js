const { SlashCommandBuilder } = require('discord.js');
const { reagan_messages } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reagan')
		.setDescription('Glaze Ronald Reagan!'),
	async execute(interaction) {
		await interaction.reply(reagan_messages[Math.floor(Math.random() * reagan_messages.length)]);
	},
};