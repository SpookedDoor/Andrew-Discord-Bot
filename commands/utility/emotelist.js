const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('emotelist')
		.setDescription('Show all bot emotes'),
	async execute(interaction) {
		try {
			await interaction.reply({
				content: "<:tomoko_cup:1358095740299116614> : <\\:tomoko_cup:1358095740299116614>\n" +
				"<:cirnoarc:1358517895809990793> : <\\:cirnoarc:1358517895809990793>\n" +
				"<:tomokoarc:1358500281956044991> : <\\:tomokoarc:1358500281956044991>\n" +
				"<:depressed:1358517922938617883> : <\\:depressed:1358517922938617883>\n" +
				"<:emoji_52:1358517952311463956> : <\\:emoji_52:1358517952311463956>\n" +
				"<:tomoko_konata:1358518030547816570> : <\\:tomoko_konata:1358518030547816570>\n" +
				"<:tomoko_bread:1358518885829185816> : <\\:tomoko_bread:1358518885829185816>\n" +
				"<:tomoko_like:1358518895627210762> : <\\:tomoko_like:1358518895627210762>\n" +
				"<:umarucry:1358518905219584120> : <\\:umarucry:1358518905219584120>\n" +
				"<:wtf:1358518914631602449> : <\\:wtf:1358518914631602449>\n" +
				"<:xd:1358518924303667272> : <\\:xd:1358518924303667272>\n",
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: "An error occurred while executing this command.", flags: MessageFlags.Ephemeral });
		}
	},
};