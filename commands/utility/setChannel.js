const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const db = require('../../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('ADMIN: Set or clear the default channel for random messages')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send random messages to (leave empty to clear)')
                .setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
            return;
        }

        const channel = interaction.options.getChannel('channel');
        if (!channel) {
            await db.query('DELETE FROM default_channels WHERE guild_id = $1', [interaction.guild.id]);
            return await interaction.reply({ content: 'Default channel cleared. The bot will auto-select a channel.', flags: MessageFlags.Ephemeral });
        }

        if (channel.type !== 0) { // 0 = GuildText
            return await interaction.reply({ content: 'Please select a text channel.', flags: MessageFlags.Ephemeral });
        }

        await db.query(`
            INSERT INTO default_channels (guild_id, channel_id)
            VALUES ($1, $2)
            ON CONFLICT (guild_id) DO UPDATE SET channel_id = EXCLUDED.channel_id
        `, [interaction.guild.id, channel.id]);

        await interaction.reply({ content: `Default channel set to <#${channel.id}>.`, flags: MessageFlags.Ephemeral });
    },
};