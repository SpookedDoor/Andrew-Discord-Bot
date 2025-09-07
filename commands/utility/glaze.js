const { SlashCommandBuilder } = require('discord.js');
const { getRandomMessage } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('glaze')
		.setDescription('Make Androo glaze one of his goats as he usually does!')
		.addStringOption(option =>
			option.setName('goat')
				.setDescription('Goat to glaze')
				.setRequired(true)
				.addChoices(
					{ name: 'Griffith', value: 'griffith' },
					{ name: 'Kanye', value: 'kanye' },
					{ name: 'Reagan', value: 'reagan' },
					{ name: 'Nick Fuentes', value: 'nick' },
					{ name: 'KSI', value: 'ksi' },
					{ name: 'Mussolini', value: 'mussolini' },
					{ name: 'Andrew Tate', value: 'tate' }
				)
		),
	async execute(interaction) {
		try {
			const goat = interaction.options.getString('goat');
			const message = await getRandomMessage(goat);

			if (!message || (!message.content && message.files.length === 0)) {
				return interaction.reply("No messages found for that goat.");
			}

			await interaction.reply(message);
		} catch (error) {
			console.error('Error executing glaze command:', error);
			await interaction.reply('There was an error while executing this command.');
		}
	},
};