import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import db from "../../database/db.js";

export default {
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Say hiii Androo!")
        .addUserOption((option) =>
            option.setName("user").setDescription("Input user").setRequired(false),
        )
        .addBooleanOption((option) =>
            option.setName("mention").setDescription("Mention the user or not").setRequired(false),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const greetings = ["hiii", "hello", "hi"];
            const greeting = greetings[Math.floor(Math.random() * greetings.length)];
            if (interaction.options.getUser("user")) {
                const user = interaction.options.getUser("user");
                if (!user) throw new Error("User not found");
                const { rows } = await db.query(
                    "SELECT id, username, display_name, is_god FROM users WHERE id = $1",
                    [user.id],
                );
                const god = rows.find((r) => r.is_god);
                const title = god ? (Math.random() < 0.5 ? "god" : "God") : "friend";
                let displayName = rows[0] ? rows[0].display_name : user.displayName;
                if (user.id === process.env.OWNER2_ID)
                    displayName = Math.random() < 0.5 ? "spooked" : "SpookedDoor";
                displayName = interaction.options.getBoolean("mention")
                    ? `<@${user.id}>`
                    : displayName;
                return await interaction.reply(`${greeting} ${displayName} ${title}`);
            } else {
                const user = interaction.user;
                const { rows } = await db.query(
                    "SELECT id, username, display_name, is_god FROM users WHERE id = $1",
                    [user.id],
                );
                const god = rows.find((r) => r.is_god);
                const title = god ? (Math.random() < 0.5 ? "god" : "God") : "friend";
                let displayName = rows[0] ? rows[0].display_name : user.displayName;
                if (user.id === process.env.OWNER2_ID)
                    displayName = Math.random() < 0.5 ? "spooked" : "SpookedDoor";
                displayName = interaction.options.getBoolean("mention")
                    ? `<@${user.id}>`
                    : displayName;
                return await interaction.reply(`${greeting} ${displayName} ${title}`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while executing this command.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
