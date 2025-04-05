const { SlashCommandBuilder } = require('discord.js');
var today = new Date();
var time = today.getHours();
var message;

if (time < 12) {
	message = 'morning';
} else if (time < 18) {
	message = 'hello';
} else {
	message = 'GN';
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('griffith')
		.setDescription('Androo think he Griffith'),
	async execute(interaction) {
		await interaction.reply(message +' all i am Griffith');
	},
};