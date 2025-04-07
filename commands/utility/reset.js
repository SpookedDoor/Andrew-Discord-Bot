const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Resets lil Androo!'),
	async execute(interaction) {
		await interaction.reply('<:tomoko_cup:1358095740299116614>');
	},
}; 
