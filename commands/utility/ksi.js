const { SlashCommandBuilder } = require('discord.js');

const ksi_messages = [
	"ksi is based", "ksi is funny", "from the screen to the ring to the pen to the king", "https://youtu.be/At8v_Yc044Y",
	"https://tenor.com/view/from-the-screen-to-the-ring-the-the-pen-to-the-king-ksi-gif-12257927774644906851"
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ksi')
		.setDescription('Glaze KSI!'),
	async execute(interaction) {
		await interaction.reply(ksi_messages[Math.floor(Math.random() * ksi_messages.length)]);
	},
};