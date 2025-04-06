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
		.setDescription('Say hiii Androo!'),
	async execute(interaction) {
		const god = gods.find(g => 
        	interaction.user.username.toLowerCase().includes(g.user.toLowerCase()) || 
        	interaction.member?.displayName.toLowerCase().includes(g.display.toLowerCase())
    	);
		let title = god ? 'god' : 'friend';
		const displayName = interaction.member?.displayName || interaction.user.username;

		await interaction.reply(`hiii ${god ? god.display : displayName} ${title}`);
	},
};