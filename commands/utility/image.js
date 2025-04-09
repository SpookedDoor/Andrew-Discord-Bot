const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('image')
		.setDescription('ADMIN: Make Androo send an image!')
		.addAttachmentOption(option =>
			option.setName('image')
				.setDescription('Image')
				.setRequired(true)),
	async execute(interaction) {
		try {
			if (
				gods.find(g => interaction.user.username === g.user) ||
				interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild) ||
				!interaction.guild
			) {
				const attachment = interaction.options.getAttachment('image').url;

				console.log(`/image command used by: ${interaction.user.username}\nLocation: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : 'DM'}\nAttachment: ${attachment}`);

				await interaction.reply({ content: `Image sent: ${attachment}`, flags: MessageFlags.Ephemeral });
				if (interaction.guild) {
					await interaction.channel.send({ files: [attachment] });
					return;
				}
				else {
					await interaction.followUp({ files: [attachment] });
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
