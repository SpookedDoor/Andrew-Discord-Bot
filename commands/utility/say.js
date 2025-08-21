const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('ADMIN: Make Androo say something!')
		.addStringOption(option =>
			option.setName('text')
				.setDescription('Text message')
				.setRequired(false))
		.addAttachmentOption(option =>
			option.setName('image')
				.setDescription('Image')
				.setRequired(false)),
	async execute(interaction) {
		try {
			const allowedIds = ['1181721653634420767', '956743571980038174'];
			if (!(allowedIds.includes(interaction.user.id) || interaction.member?.permissions?.has(PermissionsBitField.Flags.ManageGuild) || !interaction.guild)) return await interaction.reply({ content: "You are not authorised to use this command.", flags: MessageFlags.Ephemeral });

			let message = interaction.options.getString('text');
			const attachment = interaction.options.getAttachment('image');
			if (!message && !attachment) return await interaction.reply({ content: "Please provide a message or an image.", flags: MessageFlags.Ephemeral });

			console.log(`/say command used by: ${interaction.user.username}\nLocation: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}\nMessage: ${message}`);
			if (attachment) {
				console.log(`Attachment: ${attachment.url}`);
				message = { content: message, files: [attachment] };
			}

			await interaction.reply({ content: `Message sent!`, flags: MessageFlags.Ephemeral });
			if (interaction.guild) return await interaction.channel.send(message); else return await interaction.followUp(message);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "An error occurred while executing this command.", flags: MessageFlags.Ephemeral });
		}
	},
};