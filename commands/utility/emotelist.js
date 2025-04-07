const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('emotelist')
		.setDescription('ADMIN: Show all bot emotes'),
	async execute(interaction) {
		try {
			if (
				gods.find(g => interaction.user.username.toLowerCase().includes(g.user.toLowerCase())) ||
				(interaction.member && interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) ||
				!interaction.guild
			) {
				// await interaction.reply({
				// 	content: "<:tomoko_cup:1358095740299116614> : <\\:tomoko_cup:1358095740299116614>\n" +
				// 	"<:cirnoarc:1358517895809990793> : <\\:cirnoarc:1358517895809990793>\n" +
				// 	"<:tomokoarc:1358500281956044991> : <\\:tomokoarc:1358500281956044991>\n" +
				// 	"<:depressed:1358517922938617883> : <\\:depressed:1358517922938617883>\n" +
				// 	"<:emoji_52:1358517952311463956> : <\\:emoji_52:1358517952311463956>\n" +
				// 	"<:tomoko_konata:1358518030547816570> : <\\:tomoko_konata:1358518030547816570>\n" +
				// 	"<:tomoko_bread:1358518885829185816> : <\\:tomoko_bread:1358518885829185816>\n" +
				// 	"<:tomoko_like:1358518895627210762> : <\\:tomoko_like:1358518895627210762>\n" +
				// 	"<:umarucry:1358518905219584120> : <\\:umarucry:1358518905219584120>\n" +
				// 	"<:wtf:1358518914631602449> : <\\:wtf:1358518914631602449>\n" +
				// 	"<:xd:1358518924303667272> : <\\:xd:1358518924303667272>\n",
				// 	flags: MessageFlags.Ephemeral,
				// });
				// return;
				const row1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('tomoko_cup')
                            .setLabel('Tomoko Cup')
                            .setStyle(1)
                            .setEmoji('1358095740299116614'),
                        new ButtonBuilder()
                            .setCustomId('cirnoarc')
                            .setLabel('Cirno Arc')
                            .setStyle(1)
                            .setEmoji('1358517895809990793'),
                        new ButtonBuilder()
                            .setCustomId('tomokoarc')
                            .setLabel('Tomoko Arc')
                            .setStyle(1)
                            .setEmoji('1358500281956044991')
                    );

                await interaction.reply({
                    content: 'Select an emoji:',
                    components: [row1],
                    flags: MessageFlags.Ephemeral,
                });

                const filter = i => i.customId && i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

                collector.on('collect', async i => {
                    try {
                        let emoji;
                        switch (i.customId) {
                            case 'tomoko_cup':
                                emoji = '<:tomoko_cup:1358095740299116614>';
                                break;
                            case 'cirnoarc':
                                emoji = '<:cirnoarc:1358517895809990793>';
                                break;
                            case 'tomokoarc':
                                emoji = '<:tomokoarc:1358500281956044991>';
                                break;
                            default:
                                emoji = 'Unknown emoji';
                        }
                        await i.reply(emoji);
                    } catch (error) {
                        console.error(error);
                    }
                });

                collector.on('end', collected => {
                    console.log(`Collected ${collected.size} interactions.`);
                });
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