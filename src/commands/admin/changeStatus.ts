import {
    ActivityType,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";

const activityTypeNames: Record<number, string> = {
    [ActivityType.Playing]: "Playing ",
    [ActivityType.Streaming]: "Streaming ",
    [ActivityType.Listening]: "Listening to ",
    [ActivityType.Watching]: "Watching ",
    [ActivityType.Custom]: "",
    [ActivityType.Competing]: "Competing in ",
};

export default {
    data: new SlashCommandBuilder()
        .setName("change")
        .setDescription("OWNER: Change Androo's status")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("status")
                .setDescription("OWNER: Change Androo's status")
                .addStringOption((option) =>
                    option.setName("status").setDescription("Status").setRequired(true),
                )
                .addIntegerOption((option) =>
                    option
                        .setName("type")
                        .setDescription("Type")
                        .addChoices(
                            { name: "Playing", value: ActivityType.Playing },
                            { name: "Streaming", value: ActivityType.Streaming },
                            { name: "Listening", value: ActivityType.Listening },
                            { name: "Watching", value: ActivityType.Watching },
                            { name: "Custom", value: ActivityType.Custom },
                            { name: "Competing", value: ActivityType.Competing },
                        )
                        .setRequired(true),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const allowedIDs = [process.env.OWNER_ID, process.env.OWNER2_ID];
        if (allowedIDs.includes(interaction.user.id)) {
        } else {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const status = interaction.options.getString("status") as string;
        const type = interaction.options.getInteger("type") as number;
        const typeName = activityTypeNames[type];

        interaction.client.user.setPresence({ activities: [{ name: status, type: type }] });
        await interaction.reply({
            content: `Status changed to: ${typeName}${status}`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
