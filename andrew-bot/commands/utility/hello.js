const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDescription('Say hiii Androo!'),
	async execute(interaction) {
		await interaction.reply('hiii ' + interaction.user.displayName + ' friend');
	},
};