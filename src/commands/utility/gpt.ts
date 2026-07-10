import { ChatInputCommandInteraction, Client, SlashCommandBuilder, TextChannel } from "discord.js";
import { aiAttachment } from "../../aiAttachments.js";
import { gptModel, openai } from "../../aiSettings.js";
import getContent from "../../characterPrompt.js";
import { cleanReply } from "../../cleanReply.js";
import { addHistory, getFormattedHistory } from "../../dbHistoryUtils.js";
import { aiGif } from "../../gifs.js";
import { createIdentityContext } from "../../userIdentities.js";
import type OpenAI from "openai";

export async function generateChatCompletion(
    serverId: string | null,
    userId: string,
    prompt: string,
    finalPrompt: string,
    model: string,
    username: string | null = null,
    client: Client,
) {
    const history = await getFormattedHistory(serverId, userId, 10);
    const { displayName, identityContext } = await createIdentityContext(userId, username, client);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: `${await getContent(finalPrompt)}\n\n${identityContext}` },
        ...history,
        { role: "user", content: displayName + ": " + finalPrompt },
    ];

    const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.8,
    });

    const content = response?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        console.error("Invalid AI response:", JSON.stringify(response, null, 2));
        throw new Error("Empty or invalid AI response");
    }

    const reply = cleanReply(content);

    await addHistory(serverId, userId, displayName, displayName + ": " + prompt, "user");
    await addHistory(serverId, userId, "Andrew", "Andrew: " + reply, "assistant");

    console.log(`AI response: ${reply}`);
    return reply;
}

export default {
    data: new SlashCommandBuilder()
        .setName("gpt")
        .setDescription("Talk to AI-powered lil Androo")
        .addStringOption((option) =>
            option.setName("prompt").setDescription("Say something to Androo").setRequired(true),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const prompt = interaction.options.getString("prompt");
        const model = gptModel;

        try {
            await interaction.deferReply();

            console.log(
                `Model used: ${model}, Location: ${
                    interaction.guild && interaction.channel instanceof TextChannel
                        ? `${interaction.guild.name} - ${interaction.channel.name}`
                        : `${interaction.user.username} - DM`
                }, Prompt: ${prompt}`,
            );

            const reply = await generateChatCompletion(
                interaction.guild?.id ?? null,
                interaction.user.id,
                prompt ?? "",
                prompt ?? "",
                model,
                interaction.user.username,
                interaction.client,
            );

            const gif = await aiGif(reply);
            const attachments = await aiAttachment(reply);

            attachments
                ? await interaction.editReply({ content: reply, files: attachments })
                : await interaction.editReply(reply);

            if (gif) {
                if (interaction.guild) {
                    if (interaction.channel?.isSendable()) {
                        await interaction.channel.send(gif);
                    }
                } else {
                    await interaction.followUp(gif);
                }
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply("Failed to generate AI response");
        }
    },
};
