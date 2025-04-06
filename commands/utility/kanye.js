const { SlashCommandBuilder } = require('discord.js');

messages = ["Kanye the goat", "I love Kanye", "Kanye will drop new album", "new kanye interview", "Like new Kanye album?", "This aint cheddar this quiche", "I hang whit the vultures", "You like vultures also?", "I like vultures", "Vultures 2 is goated", "I got all to hang whit the vultures"]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kanye')
		.setDescription('Glaze Kanye!'),
	async execute(interaction) {
		await interaction.reply(messages[Math.floor(Math.random() * messages.length)]);
	},
};