const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Resets lil Androo!'),
	async execute(interaction) {
		await interaction.reply('https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141');

		try {
			if (interaction.guild) {
				await interaction.channel.send('This aint cheddar this quiche');
				await interaction.channel.send('<:tomoko_cup:1358095740299116614>');
			}
			else {
				await interaction.user.send('This aint cheddar this quiche');
				await interaction.user.send('<:tomoko_cup:1358095740299116614>');
			}
		} catch (error) {
			console.error('Follow-up failed:', error);
		}
	},
}; 
