import {
    ChatInputCommandInteraction,
    MessageFlags,
    PermissionsBitField,
    SlashCommandBuilder,
} from "discord.js";
import db from "../../database/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("ADMIN: Enable or disable random messages")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("messages")
                .setDescription("ADMIN: Enable or disable random messages")
                .addBooleanOption((option) =>
                    option.setName("disabled").setDescription("Default: false").setRequired(true),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) throw new Error("Not a guild");
        const allowedIds = [process.env.OWNER_ID, process.env.OWNER2_ID];
        const permission =
            allowedIds.includes(interaction.user.id) ||
            interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);

        if (!permission) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const disabled = interaction.options.getBoolean("disabled");

        if (disabled) {
            await db.query(
                "INSERT INTO disabled_guilds (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name",
                [interaction.guild.id, interaction.guild.name],
            );
            await interaction.reply({
                content: "Random messages have been disabled in this server.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        } else {
            await db.query("DELETE FROM disabled_guilds WHERE id = $1", [interaction.guild.id]);
            await interaction.reply({
                content: "Random messages have been enabled in this server.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
    },
};
