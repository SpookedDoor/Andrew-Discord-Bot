const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const db = require('../../db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('ADMIN: Enable or disable random messages')
            .addSubcommand(subcommand =>
                subcommand
                .setName('messages')
                .setDescription('ADMIN: Enable or disable random messages')
                .addBooleanOption(option =>
                    option.setName('disabled')
                        .setDescription('Default: false')
                        .setRequired(true)
                )
            ),
	async execute(interaction) {
        const allowedIds = [process.env.OWNER_ID, process.env.OWNER2_ID];
        if (!(allowedIds.includes(interaction.user.id) || interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        const disabled = interaction.options.getBoolean('disabled');

        if (disabled) {
            await db.query('INSERT INTO disabled_guilds (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name', [interaction.guild.id, interaction.guild.name]);
            await interaction.reply({ content: 'Random messages have been disabled in this server.', flags: MessageFlags.Ephemeral });
            return;
        } else {
            await db.query('DELETE FROM disabled_guilds WHERE id = $1', [interaction.guild.id]);
            await interaction.reply({ content: 'Random messages have been enabled in this server.', flags: MessageFlags.Ephemeral });
            return;
        }
    },
};