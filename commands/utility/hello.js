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
		
		if (name && name.trim() !== '') {
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
	},
};