const { SlashCommandBuilder } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
	{ user: 'hellbeyv2', display: 'hellbey' },
	{ user: 'sillyh.', display: 'trinke' },
	{ user: 'nonamebadass', display: 'poncho' }
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDescription('Say hiii Androo!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Input name')
				.setRequired(false)),
	async execute(interaction) {
		const name = interaction.options.getString('input');
		let god = gods.find(g => interaction.user.username.toLowerCase().includes(g.user.toLowerCase()) || 
        	interaction.member?.displayName.toLowerCase().includes(g.display.toLowerCase())
    	);
		
		try {
			if (name && name.trim() !== '') {
				const mentionMatch = name.match(/^<@!?(\d+)>$/);
				if (mentionMatch) {
					const userId = mentionMatch[1];
					const mentionedUser = await interaction.client.users.fetch(userId);

					god = gods.find(g => mentionedUser.username.toLowerCase().includes(g.user.toLowerCase()) ||
						mentionedUser.displayName.toLowerCase().includes(g.display.toLowerCase())
					);
					await interaction.reply(`hiii ${name} ${god ? 'god' : 'friend'}`);
					return;
				}
				
				god = gods.find(g => name.toLowerCase().includes(g.user.toLowerCase()) ||
					name.toLowerCase().includes(g.display.toLowerCase())
				);
				await interaction.reply(`hiii ${name} ${god ? 'god' : 'friend'}`);
				return;
			}
			else {
				const displayName = interaction.member?.displayName || interaction.user.username;
				await interaction.reply(`hiii ${god ? god.display : displayName} ${god ? 'god' : 'friend'}`);
				return;
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while executing this command.', flags: MessageFlags.Ephemeral });
		}
	},
};