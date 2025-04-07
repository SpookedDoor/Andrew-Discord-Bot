const { SlashCommandBuilder } = require('discord.js');

const nick_messages = [
	"nick fuentes is straight", "https://tenor.com/view/nick-fuentes-fuentes-nicholas-j-fuentes-is-for-me-me-gif-3856804053130586186",
	"https://tenor.com/view/fuentes-shooting-you-are-fun-gif-1701233573689015350"
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fuentes')
		.setDescription('Glaze Nick Fuentes!'),
	async execute(interaction) {
		await interaction.reply(nick_messages[Math.floor(Math.random() * nick_messages.length)]);
	},
};