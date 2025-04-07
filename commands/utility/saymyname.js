const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('saymyname')
		.setDescription('Say my name'),
	async execute(interaction) {
		await interaction.reply("https://tenor.com/view/waltwhite-breakingbad-say-my-name-gif-7259290");
		await interaction.followUp("Andrew Valenzuela");
	},
};