const { SlashCommandBuilder } = require('discord.js');

const kanye_messages = [
	"Kanye the goat", "I love Kanye", "Kanye will drop new album", "new kanye interview", "Like new Kanye album?", 
	"This aint cheddar this quiche", "I hang whit the vultures", "You like vultures also?", "I like vultures", "Vultures 2 is goated", 
	"I got all to hang whit the vultures", "I got no rapper friends i hang whit the vultures","https://tenor.com/view/kanye-west-vultures-everybody-new-gif-12847039774498163445", 
	"https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141", 
	"https://tenor.com/view/kanye-west-gif-1846075065280866456", "https://tenor.com/view/kanye-west-kanye-ye-um-uhm-gif-1371611536126645899", 
	"https://tenor.com/view/kanye-west-my-reaction-to-that-information-my-honest-reaction-meme-gif-15000744814966995138"
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kanye')
		.setDescription('Glaze Kanye!'),
	async execute(interaction) {
		await interaction.reply(kanye_messages[Math.floor(Math.random() * kanye_messages.length)]);
	},
};