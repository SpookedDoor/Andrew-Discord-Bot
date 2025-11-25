const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { findUserIdentity } = require('../../userIdentities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('OWNER: Get user info')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to get info about')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('Enter a user ID to get info about')
                .setRequired(false)
        ),
	async execute(interaction) {
        const allowedIds = [process.env.OWNER_ID, process.env.OWNER2_ID];
        if (!allowedIds.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
        }

        let userId;
        if (interaction.options.getMember('user')) userId = interaction.options.getMember('user').id;
        else if (interaction.options.getString('userid')) userId = interaction.options.getString('userid');
        else userId = interaction.user.id;

        const identity = await findUserIdentity(userId, interaction.client);

        let info = `**User Info:**\n`;
        info += `ID: ${identity?.id || userId || 'unknown'}\n`;
        info += `Display Name: ${identity?.displayName || 'unknown'}\n`;
        info += `Usernames/Nicknames: ${(identity?.usernames && identity.usernames.length) ? identity.usernames.join(', ') : 'unknown'}\n`;
        if (identity?.traits && identity.traits.length) info += `Traits: ${identity.traits.join(', ')}\n`;
        if (identity?.isGod) info += `Tag: God\n`;
        if (identity?.isCreator) info += `Tag: Creator\n`;
        if (identity?.note) info += `Note: ${identity.note}\n`;

        await interaction.reply({ content: info, flags: MessageFlags.Ephemeral });
	},
};