import {
    ChatInputCommandInteraction,
    MessageFlags,
    PermissionsBitField,
    SlashCommandBuilder,
    TextChannel,
    type InteractionReplyOptions,
    type MessageCreateOptions,
} from "discord.js";
import { getAge } from "../../database/messageDatabase.js";

export default {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("ADMIN: Make Androo say something!")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("message")
                .setDescription("ADMIN: Make Androo say something or send an image!")
                .addStringOption((option) =>
                    option.setName("text").setDescription("Text message").setRequired(false),
                )
                .addAttachmentOption((option) =>
                    option.setName("image").setDescription("Image").setRequired(false),
                ),
        )
        .addSubcommandGroup((group) =>
            group
                .setName("my")
                .setDescription("Say my name")
                .addSubcommand((subcommand) =>
                    subcommand.setName("name").setDescription("Say my name"),
                )
                .addSubcommand((subcommand) =>
                    subcommand.setName("age").setDescription("Say my age"),
                ),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (interaction.options.getSubcommand(false) === "name") {
                await interaction.reply(
                    "https://tenor.com/view/waltwhite-breakingbad-say-my-name-gif-7259290",
                );
                return await interaction.followUp("Andrew Valenzuela");
            }

            if (interaction.options.getSubcommand(false) === "age") {
                const sentences = [
                    "My birth was quite unique you see, one could even say... miraculous, for I had the rare condition of being born brainless.",
                    "Somehow I ended up living, to the doctors' surprise.",
                    "They couldn't figure out how I am living.",
                    "I don't know either, well of course I wouldn't, I don't even have a brain!",
                    "They theorised that I didn't need a brain to function, but even if I did have one, I'd barely even use it at all!",
                    "As I grew up, it turned out that I actually had a brain, but it was microscopic!",
                    "That might be why they thought I didn't have a brain, but I might as well still be brainless because I've no idea how to use it!",
                    "My brain function cannot go beyond Kanye lyrics, parroting lines, fangirling over Tomoko, and glazing bad people.",
                    "There really isn't much capacity for anything else, so these are the most important things to me.",
                    "I usually delude myself into thinking I'm Griffith, Alien X or God, heck Griffith God even.",
                    "Did I mention I'm from Alabama?",
                    "I'm also a right winged fascist liberal by the way.",
                ].join(" ");

                return await interaction.reply(
                    `I am ${getAge()}, born on 19 November 2002.\n\n${sentences}`,
                );
            }

            const allowedIds = [process.env.OWNER_ID, process.env.OWNER2_ID];
            const permission =
                allowedIds.includes(interaction.user.id) ||
                interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild) ||
                !interaction.guild;

            if (!permission) {
                return await interaction.reply({
                    content: "You are not authorised to use this command.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            let message: string | MessageCreateOptions | null =
                interaction.options.getString("text");
            const attachment = interaction.options.getAttachment("image");
            if (!message && !attachment) {
                return await interaction.reply({
                    content: "Please provide a message or an image.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            console.log(
                `/say command used by: ${interaction.user.username}\nLocation: ${
                    interaction.guild && interaction.channel instanceof TextChannel
                        ? `${interaction.guild.name} - ${interaction.channel.name}`
                        : `${interaction.user.username} - DM`
                }\nMessage: ${message}`,
            );

            if (attachment) {
                console.log(`Attachment: ${attachment.url}`);
                message = { content: message as string, files: [attachment] };
            }

            if (!message) throw new Error("No message");
            await interaction.reply({ content: `Message sent!`, flags: MessageFlags.Ephemeral });
            if (interaction.channel?.isSendable()) return await interaction.channel.send(message);
            else return await interaction.followUp(message as InteractionReplyOptions);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while executing this command.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
