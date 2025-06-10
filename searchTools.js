const OpenAI = require('openai');
require('dotenv').config();
const { baseURL, apiKey } = require('./aiSettings.js');
const openai = new OpenAI({ 
    baseURL: baseURL,
    apiKey: apiKey
});

module.exports.askIfToolIsNeeded = async function (userPrompt, model, imageUrl = null, generateImagePrompt = null) {
    let enrichedPrompt = userPrompt;

    if (imageUrl && typeof generateImagePrompt === 'function') {
        try {
            const imageDescription = await generateImagePrompt("Describe this image briefly:", imageUrl, model);
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