const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});
const content = require('../../characterPrompt.js');
const { braveSearch } = require('../../braveSearch.js');
const { braveImageSearch } = require('../../braveImageSearch.js');

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
                .setRequired(false))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Select a multimodal model')
                .setRequired(false)
                .addChoices(
                    { name: 'Optimus Alpha', value: 'openrouter/optimus-alpha' },
                    { name: 'Llama 4 Scout', value: 'meta-llama/llama-4-scout:free' },
                    { name: 'Llama 4 Maverick', value: 'meta-llama/llama-4-maverick:free' },
                    { name: 'Mistral Small 3.1', value: 'mistralai/mistral-small-3.1-24b-instruct:free' },
                    { name: 'Google Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-exp:free' },
                    { name: 'Google Gemma 3', value: 'google/gemma-3-27b-it:free' },
                )),

    async execute(interaction) {
        const imageAttachment = interaction.options.getAttachment('image');
        const imageUrl = imageAttachment.url;
        const prompt = interaction.options.getString('prompt') || "Hey Andrew, describe this image and tell me what you think of this?";
        const model = interaction.options.getString('model') || 'openrouter/optimus-alpha';

        await interaction.deferReply();

        try {
            const toolDecision = await askIfToolIsNeeded(prompt, model, imageUrl);
            let enrichedPrompt = prompt;

            if (toolDecision.startsWith("WEB_SEARCH:")) {
                const query = toolDecision.replace("WEB_SEARCH:", "").trim();
                const webResults = await braveSearch(query);
                enrichedPrompt = `${prompt}\n\nRelevant web results:\n${webResults}`;
                console.log(`🔍 Web search used with query: "${query}"\n${webResults}`);
            } else if (toolDecision.startsWith("IMAGE_SEARCH:")) {
                const query = toolDecision.replace("IMAGE_SEARCH:", "").trim();
                const imageResults = await braveImageSearch(query);
                enrichedPrompt = `${prompt}\n\nRelevant image results:\n${imageResults}`;
                console.log(`🖼️  Image search used with query: "${query}"\n${imageResults}`);
            } else {
                console.log("No internet tools used.");
            }

            const reply = await module.exports.generateImagePrompt(enrichedPrompt, imageUrl, model);
            console.log(`Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
            console.log(`Prompt: ${enrichedPrompt}, Image URL: ${imageUrl}\nAI response: ${reply}`);
            await interaction.editReply({ content: reply, files: [imageUrl] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("There was a problem analysing the image.");
        }
    }
};

module.exports.generateImagePrompt = async function (promptText, imageUrl, model) {
    try {
        const response = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: promptText },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            temperature: 0.9
        });

        const reply = response.choices[0]?.message?.content || "Couldn't describe the image";
        return reply;

    } catch (err) {
        console.error("Image prompt failed:", err);
        throw new Error("Image analysis failed.");
    }
};

async function askIfToolIsNeeded(userPrompt, model, imageUrl = null) {
    let enrichedPrompt = userPrompt;

    if (imageUrl) {
        try {
            const imageDescription = await module.exports.generateImagePrompt("Describe this image briefly:", imageUrl, model);
            enrichedPrompt = `${userPrompt}\n\nImage description: ${imageDescription}`;
        } catch (err) {
            console.error("Failed to describe image for tool decision:", err);
        }
    }

    const toolPrompt = `
A user asked: "${enrichedPrompt}"

Decide what tool (if any) is needed to answer.
- If you need to search the web for context, reply with: WEB_SEARCH: <query>
- If you need to find image results, reply with: IMAGE_SEARCH: <query>
- If you can answer without using the internet, reply with: NO_SEARCH

Only respond with one of the above formats. Do not include any extra text.
    `;

    const result = await openai.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: "You're an assistant that helps decide when external tools are needed to answer." },
            { role: 'user', content: toolPrompt }
        ],
        temperature: 0.2
    });

    return result.choices[0]?.message?.content.trim() || "NO_SEARCH";
}
