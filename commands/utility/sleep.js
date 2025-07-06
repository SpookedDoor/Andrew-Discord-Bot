const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const status = require('../../setSleep.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
];

const { sleepytime } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sleep')
		.setDescription('ADMIN: Make Androo sleep'),
	async execute(interaction) {
		try {
			if (!interaction.guild) {
				await interaction.reply({
					content: 'This command can only be used in a server.',
					flags: MessageFlags.Ephemeral,
				})
				return;
			}
			
			const serverId = interaction.guild.id;
			if (
				gods.find(g => interaction.user.username === g.user) || 
				interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild)
			) {
				status.setSleepStatus(serverId, true);
				status.setManualMode(serverId, 'sleep');
				await interaction.reply(sleepytime[Math.floor(Math.random() * sleepytime.length)]);
			}
			else {
				await interaction.reply({ content: "You are not authorised to use this command.", flags: MessageFlags.Ephemeral });
				return;
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "An error occurred while executing this command.", flags: MessageFlags.Ephemeral });
		}
	},
};