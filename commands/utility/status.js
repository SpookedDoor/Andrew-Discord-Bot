const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const status = require('../../setSleep.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Check if lil Androo is sleeping'),
	async execute(interaction) {
		if (!interaction.guild) {
			await interaction.reply({
				content: 'This command can only be used in a server.',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		await interaction.reply(`Lil Androo is currently ${status.getSleepStatus(interaction.guild.id) ? 'asleep' : 'awake'}`);
	},
};