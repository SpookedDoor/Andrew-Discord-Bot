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
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        let userId, username, member, fetchedUser;
        member = interaction.options.getMember('user');
        if (member) {
            userId = member.id;
        } else if (interaction.options.getString('userid')) {
            userId = interaction.options.getString('userid');
            username = undefined;
        } else {
            member = interaction.member;
            userId = member.id;
            username = member.user.username;
        }

        const guild = interaction.guild;
        const identity = await findUserIdentity({ id: userId, name: username, guild });

        if (!identity && userId) {
            try {
                fetchedUser = await interaction.client.users.fetch(userId);
            } catch (e) {
                // ignore error, user may not be fetchable
            }
        }

        let info = `**User Info:**\n`;
        info += `ID: ${identity?.id || userId || 'unknown'}\n`;
        info += `Display Name: ${identity?.displayName || member?.displayName || fetchedUser?.displayName || 'unknown'}\n`;
        info += `Usernames/Nicknames: ${(identity?.usernames && identity.usernames.length) ? identity.usernames.join(', ') : (username || fetchedUser?.username || 'unknown')}\n`;
        if (identity?.traits && identity.traits.length) info += `Traits: ${identity.traits.join(', ')}\n`;
        if (identity?.isGod) info += `Tag: God\n`;
        if (identity?.isCreator) info += `Tag: Creator\n`;
        if (identity?.note) info += `Note: ${identity.note}\n`;

        await interaction.reply({ content: info, flags: MessageFlags.Ephemeral });
	},
};