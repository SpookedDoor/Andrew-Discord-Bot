import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("reset").setDescription("Resets lil Androo!"),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply("<:tomoko_cup:1358095740299116614>");
    },
};
