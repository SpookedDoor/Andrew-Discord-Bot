import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    type InteractionReplyOptions,
} from "discord.js";
import db from "../../database/db.js";
import { getMessages, getRandomMessage } from "../../database/messageDatabase.js";

export default {
    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("Make Androo send a random message")
        .addSubcommandGroup((group) =>
            group
                .setName("random")
                .setDescription("Make Androo send a random message")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("message")
                        .setDescription("Make Androo send a random message")
                        .addStringOption((option) =>
                            option
                                .setName("category")
                                .setDescription("Choose a category")
                                .setRequired(true)
                                .setAutocomplete(true),
                        ),
                ),
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        try {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === "category") {
                const categories = await db.query(`SELECT name FROM message_categories`);
                const choices = categories.rows.map((row) => row.name);
                const filtered = choices.filter((choice) =>
                    choice.toLowerCase().includes(focusedOption.value.toLowerCase()),
                );
                await interaction.respond(
                    filtered.map((choice) => ({ name: choice, value: choice })).slice(0, 25),
                );
            }
        } catch (error) {
            console.error("Error during autocomplete:", error);
        }
    },
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const category = interaction.options.getString("category") as string;
            if (category.includes("batch")) {
                let combined = "";
                const messages = await getMessages(category);
                for (const msg of messages) combined += `${msg.content}\n`;
                await interaction.reply(combined);
            } else {
                const message = (await getRandomMessage(category)) as InteractionReplyOptions;
                await interaction.reply(message);
            }
        } catch (error) {
            console.error("Error executing send command:", error);
            await interaction.reply("There was an error while executing this command.");
        }
    },
};
