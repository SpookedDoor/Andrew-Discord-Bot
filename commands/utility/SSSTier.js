const { SlashCommandBuilder } = require('discord.js');
const { SSSTierOpinions } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sss_tier_opinions')
		.setDescription("You're at risk of hearing lil Androo's opinons!"),
	async execute(interaction) {
		await interaction.reply(SSSTierOpinions[Math.floor(Math.random() * SSSTierOpinions.length)]);
	},
};