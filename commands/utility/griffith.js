const { SlashCommandBuilder } = require('discord.js');

let timed_message = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'hello' : 'GN';
const griffith_messages = [timed_message + ' all i am Griffith', 'I am prime Griffith', 'https://i.imgflip.com/9q0wk1.jpg'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('griffith')
		.setDescription('Androo think he Griffith'),
	async execute(interaction) {
		await interaction.reply(griffith_messages[Math.floor(Math.random() * griffith_messages.length)]);
	},
};