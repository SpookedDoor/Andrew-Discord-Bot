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

const griffith_messages = [message + ' all i am Griffith', 'I am prime Griffith', 'https://i.imgflip.com/9q0wk1.jpg'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('griffith')
		.setDescription('Androo think he Griffith'),
	async execute(interaction) {
		await interaction.reply(Math.floor(Math.random() * griffith_messages.length));
	},
};