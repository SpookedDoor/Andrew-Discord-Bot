const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('CREATORS ONLY: Make Androo say something!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Input message')),
	async execute(interaction) {
		try {
			if (gods.find(g => interaction.user.username.toLowerCase().includes(g.user.toLowerCase()))) {
				const message = interaction.options.getString('input');
				await interaction.reply({ content: `Message sent: ${message}`, flags: MessageFlags.Ephemeral });
				await interaction.channel.send(message);
				return;
			}
			else {
                await interaction.reply({ content: "You are not authorised to use this command.", flags: MessageFlags.Ephemeral });
				return;
			}
		} catch (error) {
			console.error(error);
		}
	},
};