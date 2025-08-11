const { SlashCommandBuilder, MessageFlags, ActivityType } = require('discord.js');

const allowedIDs = ['1181721653634420767', '956743571980038174'];

const activityTypeNames = {
    [ActivityType.Playing]: 'Playing ',
    [ActivityType.Streaming]: 'Streaming ',
    [ActivityType.Listening]: 'Listening to ',
    [ActivityType.Watching]: 'Watching ',
    [ActivityType.Custom]: '',
    [ActivityType.Competing]: 'Competing in '
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changestatus')
		.setDescription("Change Androo's status")
            .addStringOption(option =>
                option.setName('status')
                    .setDescription('Status')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Type')
                    .addChoices(
                        { name: 'Playing', value: ActivityType.Playing.toString() },
                        { name: 'Streaming', value: ActivityType.Streaming.toString() },
                        { name: 'Listening', value: ActivityType.Listening.toString() },
                        { name: 'Watching', value: ActivityType.Watching.toString() },
                        { name: 'Custom', value: ActivityType.Custom.toString() },
                        { name: 'Competing', value: ActivityType.Competing.toString() }
                    )
                    .setRequired(true)
            ),
	async execute(interaction) {
        if (allowedIDs.includes(interaction.user.id)) {} else { await interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral }); return; };

        const status = interaction.options.getString('status');
        const type = parseInt(interaction.options.getString('type'));
        const typeName = activityTypeNames[type];

        interaction.client.user.setPresence({ activities: [{ name: status, type: type }] });
        await interaction.reply({ content: `Status changed to: ${typeName}${status}`, flags: MessageFlags.Ephemeral });
	},
};