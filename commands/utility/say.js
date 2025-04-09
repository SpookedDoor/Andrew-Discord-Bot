const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('ADMIN: Make Androo say something!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Input message')
				.setRequired(true)),
	async execute(interaction) {
		try {
			if (
				gods.find(g => interaction.user.username === g.user) ||
				interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild) ||
				!interaction.guild
			) {
				const message = interaction.options.getString('input');

				console.log(`/say command used by: ${interaction.user.username}\nLocation: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : 'DM'}\nMessage: ${message}`);

				await interaction.reply({ content: `Message sent: ${message}`, flags: MessageFlags.Ephemeral });
				if (interaction.guild) {
					await interaction.channel.send(message);
					return;
				}
				else {
					await interaction.followUp(message);
					return;
				}
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
