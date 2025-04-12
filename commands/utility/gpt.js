const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({ 
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: process.env.OPENROUTER_API_KEY 
});
const content = require('../../characterPrompt.js');
const { braveSearch } = require('../../braveSearch.js');
const { braveImageSearch } = require('../../braveImageSearch.js');

const userHistories = {};
const MAX_HISTORY = 5;

const askIfToolIsNeeded = async (userPrompt, model) => {
    const toolPrompt = `
        A user asked: "${userPrompt}"
        
        Decide what tool (if any) is needed to answer.
        
        - If you need to search the web for context, reply with: WEB_SEARCH: <query>
        - If you need to find image results, reply with: IMAGE_SEARCH: <query>
        - If you can answer without using the internet, reply with: NO_SEARCH
        
        Only respond with one of the above formats. Do not include any extra text.
        `;

    const decision = await module.exports.generateChatCompletion('system', toolPrompt, model);
    return decision.trim();
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpt')
        .setDescription('Talk to AI-powered lil Androo')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Say something to Androo')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Select a model')
                .setRequired(false)
                .addChoices(
                    { name: 'Optimus Alpha', value: 'openrouter/optimus-alpha' },
                    { name: 'Deepseek V3', value: 'deepseek/deepseek-chat-v3-0324:free' },
                    { name: 'Llama 4 Scout', value: 'meta-llama/llama-4-scout:free' },
                    { name: 'Llama 4 Maverick', value: 'meta-llama/llama-4-maverick:free' },
                    { name: 'Llama 3.1 Nemotron Ultra', value: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free' },
                    { name: 'Mistral Small 3.1', value: 'mistralai/mistral-small-3.1-24b-instruct:free' },
                    { name: 'Google Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-exp:free' },
                    { name: 'Google Gemma 3', value: 'google/gemma-3-27b-it:free' },
                )),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const model = interaction.options.getString('model') ? interaction.options.getString('model') : 'openrouter/optimus-alpha';

        try {
            await interaction.deferReply();
        
            console.log(`Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}, Prompt: ${prompt}`);
        
            let finalPrompt = prompt;
            const toolDecision = await askIfToolIsNeeded(prompt, model);
        
            if (toolDecision.startsWith("WEB_SEARCH:")) {
                const query = toolDecision.replace("WEB_SEARCH:", "").trim();
                const searchResults = await braveSearch(query);
                finalPrompt = `User asked: "${prompt}"\n\nRelevant web results:\n${searchResults}`;
                console.log(`🔍 Web search used with query: "${query}"\n${searchResults}`);
            } else if (toolDecision.startsWith("IMAGE_SEARCH:")) {
                const query = toolDecision.replace("IMAGE_SEARCH:", "").trim();
                const imageResults = await braveImageSearch(query);
                finalPrompt = `User asked: "${prompt}"\n\nRelevant image links:\n${imageResults}`;
                console.log(`🖼️ Image search used with query: "${query}"\n${imageResults}`);
            } else {
                console.log(`No internet tools used.`);
            }
        
            const reply = await module.exports.generateChatCompletion(interaction.user.id, finalPrompt, model);

	        console.log(`AI response: ${reply}`);

            await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply("Can't think now... try again later");
        }    
    }
};

module.exports.generateResponse = async function(prompt, model) {
    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: content
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 200
    });

    if (response?.choices && response.choices[0]?.message?.content) {
        const reply = response.choices[0].message.content;
        return reply;
    } else {
        throw new Error("Invalid response structure from model.");
    }
}

module.exports.generateChatCompletion = async function(userId, prompt, model) {
    if (!userHistories[userId]) userHistories[userId] = [];

    // Add new user message
    userHistories[userId].push({ role: "user", content: prompt });

    // Trim history
    userHistories[userId] = userHistories[userId].slice(-MAX_HISTORY);

    const messages = [
        { role: "system", content },
        ...userHistories[userId]
    ];

    const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.9,
        max_tokens: 200
    });

    if (response?.choices?.[0]?.message?.content) {
        const reply = response.choices[0].message.content;
        userHistories[userId].push({ role: "assistant", content: reply });
        return reply;
    } else {
        throw new Error("Invalid response structure");
    }
};
