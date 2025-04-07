const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Resets lil Androo!'),
	async execute(interaction) {
		await interaction.reply('https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141');

try {
await interaction.followUp({
  content: 'This aint cheddar this quiche',
  allowedMentions: { repliedUser: false },
});
else {
await interaction.user.send('This aint cheddar this quiche');
}
}
catch (error) {
console.error('Follow-up failed: error');
}
	},
}; 
