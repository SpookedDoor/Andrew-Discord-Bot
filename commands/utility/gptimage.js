const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();
const { baseURL, apiKey, gptimageModel } = require('../../aiSettings.js');
const openai = new OpenAI({
    baseURL: baseURL,
    apiKey: apiKey
});
const content = require('../../characterPrompt.js');
const { askIfToolIsNeeded } = require('../../searchTools.js');
const { braveSearch } = require('../../braveSearch.js');
const { braveImageSearch } = require('../../braveImageSearch.js');
const { googleImageSearch } = require('../../googleImageSearch.js');
const fetch = require('node-fetch');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gptimage')
        .setDescription('Make lil Androo describe an image!')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Image to analyse')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Text prompt')
                .setRequired(false)),

    async execute(interaction) {
        const imageAttachment = interaction.options.getAttachment('image');
        const imageUrl = imageAttachment.url;
        const prompt = interaction.options.getString('prompt') || "Hey Andrew, describe this image and tell me what you think of this?";
        const model = gptimageModel;

        await interaction.deferReply();

        try {
            const toolDecision = await askIfToolIsNeeded(prompt, model, imageUrl, module.exports.generateImagePrompt);
            let enrichedPrompt = prompt;

            if (toolDecision.startsWith("WEB_SEARCH:")) {
                const query = toolDecision.replace("WEB_SEARCH:", "").trim();
                const webResults = await braveSearch(query);
                enrichedPrompt = `${prompt}\n\nRelevant web results:\n${webResults}`;
                console.log(`🔍 Web search used with query: "${query}"\n${webResults}`);
            } else if (toolDecision.startsWith("IMAGE_SEARCH:")) {
                const query = toolDecision.replace("IMAGE_SEARCH:", "").trim();
                const imageResults = await googleImageSearch(query);
                enrichedPrompt = `${prompt}\n\nRelevant image results:\n${imageResults}`;
                console.log(`🖼️ Image search used with query: "${query}"\n${imageResults}`);
            } else {
                console.log("No internet tools used.");
            }

            const reply = await module.exports.generateImagePrompt(enrichedPrompt, imageUrl, model);
            console.log(`Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
            console.log(`Prompt: ${prompt}, Image URL: ${imageUrl}\nAI response: ${reply}`);
            await interaction.editReply({ content: reply, files: [imageUrl] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("There was a problem analysing the image.");
        }
    }
};

module.exports.generateImagePrompt = async function (promptText, imageUrl, model) {
    try {
        const responseImg = await fetch(imageUrl);
        const buffer = await responseImg.buffer();
        const ext = path.extname(imageUrl).toLowerCase();
        let mimeType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.gif') mimeType = 'image/gif';
        const base64 = buffer.toString('base64');
        const base64Url = `data:${mimeType};base64,${base64}`;

        const personaReminder = "Stay in character as Andrew: short, unfiltered. Use 'whit' for 'with', lowercase, short sentences, never paragraphs, no full stops. If confused, use 'how'.";
        const fullPrompt = personaReminder + "Describe this image:" + promptText;

        const response = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: fullPrompt },
                        { type: 'image_url', image_url: { url: base64Url } }
                    ]
                }
            ],
            temperature: 0.9
        });

        const reply = response.choices[0]?.message?.content || "Couldn't describe the image";
        if (reply.length > 2000) {
            return reply.slice(0, 1997) + '...';
        }
        return reply;

    } catch (err) {
        console.error("Image prompt failed:", err);
        throw new Error("Image analysis failed.");
    }
};