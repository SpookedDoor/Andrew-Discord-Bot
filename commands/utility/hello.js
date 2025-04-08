const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
	{ user: 'hellbeyv2', display: 'hellbey' },
	{ user: 'sillyh.', display: 'trinke' },
	{ user: 'nonamebadass', display: 'poncho' }
];

const friends = [
	{ user: 'moonmanv2', display: 'moon man' },
	{ user: 'marv_mari', display: 'brit'},
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDescription('Say hiii Androo!')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Input user')
				.setRequired(false))
		.addBooleanOption(option =>
			option.setName('mention')
				.setDescription('Mention the user or not')
				.setRequired(false)),
	async execute(interaction) {
		try {
			if (interaction.options.getUser('user')) {
				const user = interaction.options.getUser('user');
				const god = gods.find(g => user.username.toLowerCase().includes(g.user.toLowerCase()));
				const friend = friends.find(f => user.username.toLowerCase().includes(f.user.toLowerCase()));
				await interaction.reply(`hiii ${interaction.options.getBoolean('mention') ? `<@${user.id}>` : god ? god.display : friend ? friend.display : user.displayName} ${god ? 'god' : 'friend'}`);
				return;
			}
			else {
				const god = gods.find(g => interaction.user.username.toLowerCase().includes(g.user.toLowerCase()) || 
					interaction.member?.displayName.toLowerCase().includes(g.display.toLowerCase())
				);
				const friend = friends.find(f => interaction.user.username.toLowerCase().includes(f.user.toLowerCase()) || 
					interaction.member?.displayName.toLowerCase().includes(f.display.toLowerCase())
				);
				const displayName = interaction.member?.displayName || interaction.user.username;
				await interaction.reply(`hiii ${god ? god.display : friend ? friend.display : displayName} ${god ? 'god' : 'friend'}`);
				return;
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while executing this command.', flags: MessageFlags.Ephemeral });
		}
	},
};
