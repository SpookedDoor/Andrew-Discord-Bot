const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

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
			const allowedIds = ['1181721653634420767', '956743571980038174'];
			if (
				allowedIds.includes(interaction.user.id) ||
				interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild) ||
				!interaction.guild
			) {
				const message = interaction.options.getString('input');

				console.log(`/say command used by: ${interaction.user.username}\nLocation: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}\nMessage: ${message}`);

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
