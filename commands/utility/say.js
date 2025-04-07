const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('ADMIN ONLY: Make Androo say something!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Input message')
				.setRequired(true)),
	async execute(interaction) {
		try {
			if (
				gods.find(g => interaction.user.username.toLowerCase().includes(g.user.toLowerCase())) ||
				(interaction.member &&interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) ||
				!interaction.guild
			) {
				const message = interaction.options.getString('input');
				await interaction.reply({ content: `Message sent: ${message}`, flags: MessageFlags.Ephemeral });
				if (interaction.channel) {
					await interaction.channel.send(message);
				} 
				else {
					await interaction.user.send(message);
				}
				return;
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