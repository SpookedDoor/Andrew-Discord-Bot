const { SlashCommandBuilder } = require('discord.js');
const { griffith_messages, kanye_messages, reagan_messages, nick_messages,  ksi_messages, mussolini_messages, tate_messages, } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('glaze')
		.setDescription('Make Androo glaze one of his goats as he usually does!')
		.addStringOption(option =>
			option.setName('goat')
				.setDescription('Goat to glaze')
				.setRequired(true)
				.addChoices(
					{ name: 'Griffith', value: 'griffith' },
					{ name: 'Kanye', value: 'kanye' },
					{ name: 'Reagan', value: 'reagan' },
					{ name: 'Nick Fuentes', value: 'nick' },
					{ name: 'KSI', value: 'ksi' },
					{ name: 'Mussolini', value: 'mussolini' },
					{ name: 'Andrew Tate', value: 'tate' }
				)
		),
	async execute(interaction) {
		const goat = interaction.options.getString('goat');

		const goat_messages = {
            griffith: griffith_messages,
            kanye: kanye_messages,
            reagan: reagan_messages,
            nick: nick_messages,
            ksi: ksi_messages,
            mussolini: mussolini_messages,
            tate: tate_messages,
        };

		const messages = goat_messages[goat];
		await interaction.reply(messages[Math.floor(Math.random() * messages.length)]);
	},
};