import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import path from "path";
import { aiAttachment } from "../../aiAttachments.js";
import { gptModel, gptimageModel, openai } from "../../ai/aiSettings.js";
import getContent from "../../ai/characterPrompt.js";
import { cleanReply } from "../../utils/cleanReply.js";
import { addHistory, getFormattedHistory } from "../../dbHistoryUtils.js";
import { aiGif } from "../../services/gifs.js";
import { searchSauceNAO } from "../../services/saucenao.js";
import { createIdentityContext } from "../../utils/userIdentities.js";

export async function describeImage(
    prompt = "Describe this image",
    imageUrl,
    model,
    saucenaoResults,
) {
    if (prompt == "Hey Andrew, describe this image and tell me what you think of this?")
        prompt = "Describe this image";
    let cleanPrompt;
    const referencedMatch = prompt.match(/(Referenced message from Andrew:[^\n]*)/i);
    if (referencedMatch) {
        const referenced = referencedMatch[1];
        let rest = prompt.replace(referenced, "");
        rest = rest
            .replace(/andrew/gi, "")
            .replace(/\s+/g, " ")
            .trim();
        cleanPrompt = `${referenced} ${rest}`.trim();
    } else {
        cleanPrompt = prompt
            .replace(/andrew/gi, "")
            .replace(/\s+/g, " ")
            .trim();
        if (cleanPrompt === "" || cleanPrompt === ",") cleanPrompt = "Describe this image";
    }
    console.log(`Prompt: ${cleanPrompt}`);

    const responseImg = await fetch(imageUrl);
    if (!responseImg.ok) throw new Error(`Failed to fetch image: ${responseImg.status}`);
    const mimeType = responseImg.headers.get("content-type")?.split(";")[0] || "image/png";
    const arrayBuffer = await responseImg.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Url = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const response = await openai.chat.completions.create({
        model,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `${saucenaoResults ? `Reverse image results: ${saucenaoResults}\n` : ""}Prompt: ${cleanPrompt}`,
                    },
                    { type: "image_url", image_url: { url: base64Url } },
                ],
            },
        ],
        temperature: 0.2,
    });

    return response.choices[0]?.message?.content;
}

export async function generateImagePrompt(
    serverId,
    userId,
    prompt,
    finalPrompt,
    imageUrl,
    username,
    client,
) {
    const results = await searchSauceNAO(imageUrl);
    let saucenaoResults = "";
    if (results) {
        results.forEach((r, i) => {
            if (r.similarity >= 80)
                saucenaoResults += `Result #${i + 1} | Similarity: ${r.similarity}% | Title: ${r.title} | Author: ${r.author} | Characters: ${r.characters} | Source: ${r.source}\n`;
        });
    }
    if (saucenaoResults) console.log(`SauceNAO results:\n${saucenaoResults}`);

    const history = await getFormattedHistory(serverId, userId, 10);
    const { displayName, identityContext } = await createIdentityContext(userId, username, client);
    const preresponse = await describeImage(prompt, imageUrl, gptimageModel, saucenaoResults);
    console.log(`\nResponse from vision model: ${preresponse}\n`);

    const fullPrompt = `Another person has described this image for you, put it in your own words as Andrew. Keep it short.
    ${saucenaoResults ? `Reverse image results: ${saucenaoResults}\n` : ""}Description: ${preresponse}\nPrompt from ${displayName}: ${finalPrompt}`;

    const response = await openai.chat.completions.create({
        model: gptModel,
        messages: [
            { role: "system", content: `${await getContent(fullPrompt)}\n\n${identityContext}` },
            ...history,
            { role: "user", content: displayName + ": " + fullPrompt },
        ],
        temperature: 0.8,
    });

    const content = response?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        console.error("Invalid AI response:", JSON.stringify(response, null, 2));
        throw new Error("Empty or invalid AI response");
    }

    const reply = cleanReply(content);

    await addHistory(
        serverId,
        userId,
        displayName,
        `${displayName} sent an image: ${imageUrl}\n${prompt}`,
        "user",
    );
    await addHistory(serverId, userId, "Andrew", "Andrew: " + reply, "assistant");

    console.log(`Model used: ${gptModel}\nResponse: ${reply}`);
    return reply;
}

export default {
    data: new SlashCommandBuilder()
        .setName("gptimage")
        .setDescription("Make lil Androo describe an image!")
        .addAttachmentOption((option) =>
            option.setName("image").setDescription("Image to analyse").setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("prompt").setDescription("Text prompt").setRequired(false),
        ),
    async execute(interaction) {
        const imageAttachment = interaction.options.getAttachment("image");
        const imageUrl = imageAttachment.url;
        const prompt =
            interaction.options.getString("prompt") ||
            "Hey Andrew, describe this image and tell me what you think of this?";
        const model = gptimageModel;

        await interaction.deferReply();
        try {
            console.log(
                `Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}, Prompt: ${prompt}\nImage URL: ${imageUrl}`,
            );
            const reply = await generateImagePrompt(
                interaction.guild?.id,
                interaction.user.id,
                prompt,
                prompt,
                imageUrl,
                interaction.user.username,
                interaction.client,
            );

            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            let ext = path.extname(imageUrl.split("?")[0]).toLowerCase();
            if (!ext || ![".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) ext = ".png";
            const originalImageAttachment = new AttachmentBuilder(buffer, { name: `image${ext}` });

            const gif = await aiGif(reply);
            const aiAttachments = (await aiAttachment(reply)) || [];
            const files = [originalImageAttachment, ...aiAttachments];

            await interaction.editReply({ content: reply, files });
            if (gif)
                interaction.guild
                    ? await interaction.channel.send(gif)
                    : await interaction.followUp(gif);
        } catch (err) {
            console.error(err);
            await interaction.editReply("Failed to generate AI response");
        }
    },
};
