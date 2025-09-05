const { SlashCommandBuilder } = require('discord.js');
const { getRandomMessage } = require('../../messageDatabase.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sss')
		.setDescription("You're at risk of hearing lil Androo's opinions!")
		.addSubcommandGroup(group =>
            group
			.setName('tier')
			.setDescription("You're at risk of hearing lil Androo's opinions!")
			.addSubcommand(subcommand =>
				subcommand
				.setName('opinions')
				.setDescription("You're at risk of hearing lil Androo's opinions!")
			)
        ),
	async execute(interaction) {
		await interaction.reply(await getRandomMessage('sss_tier_opinions'));
	},
};