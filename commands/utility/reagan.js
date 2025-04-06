const { SlashCommandBuilder } = require('discord.js');

messages = ["Reagan was the best", "Reagan number 1", "Reagan number 1 president ever", "Reagan turn down the wall", "Trump and Reagan goats", "Reagan and Trump best presidents ever", "Ronald pls", "https://tenor.com/view/republican-gif-24490147", "https://tenor.com/view/ronald-reagan-reagan-republican-usa-president-gif-14605911613553531779"]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reagan')
		.setDescription('Glaze Ronald Reagan!'),
	async execute(interaction) {
		await interaction.reply(messages[Math.floor(Math.random() * messages.length)]);
	},
};