import { SlashCommandBuilder } from "discord.js";
import { getRandomMessage } from "../../utils/messageDatabase.js";

export default {
    data: new SlashCommandBuilder()
        .setName("sss")
        .setDescription("You're at risk of hearing lil Androo's opinions!")
        .addSubcommandGroup((group) =>
            group
                .setName("tier")
                .setDescription("You're at risk of hearing lil Androo's opinions!")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("opinions")
                        .setDescription("You're at risk of hearing lil Androo's opinions!"),
                ),
        ),
    async execute(interaction) {
        await interaction.reply(await getRandomMessage("sss_tier_opinions"));
    },
};
