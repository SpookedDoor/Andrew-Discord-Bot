const { SlashCommandBuilder } = require('discord.js');
const { baseURL, apiKey, gptModel } = require('../../aiSettings.js');
const OpenAI = require('openai');
const openai = new OpenAI({ baseURL, apiKey });
const getContent = require('../../characterPrompt.js');
const { askIfToolIsNeeded } = require('../../searchTools.js');
const { braveSearch } = require('../../braveSearch.js');
const { googleImageSearch } = require('../../googleImageSearch.js');
const { aiAttachment } = require('../../aiAttachments.js');
const { createIdentityContext } = require('../../userIdentities.js');
const { getFormattedHistory, addHistory } = require('../../dbHistoryUtils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpt')
        .setDescription('Talk to AI-powered lil Androo')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Say something to Androo')
                .setRequired(true)),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const model = gptModel;

        try {
            await interaction.deferReply();
            let finalPrompt = prompt;

            const toolDecision = await askIfToolIsNeeded(prompt);
            if (toolDecision.startsWith("WEB_SEARCH:")) {
                const query = toolDecision.replace("WEB_SEARCH:", "").trim();
                const webResults = await braveSearch(query);
                finalPrompt = `${prompt}\n\nRelevant web results:\n${webResults}`;
                console.log(`🔍 Web search used with query: "${query}"\n${webResults}`);
            } else if (toolDecision.startsWith("IMAGE_SEARCH:")) {
                const query = toolDecision.replace("IMAGE_SEARCH:", "").trim();
                const imageResults = await googleImageSearch(query);
                finalPrompt = `${prompt}\n\nRelevant image results:\n${imageResults}`;
                console.log(`🖼️ Image search used with query: "${query}"\n${imageResults}`);
            } else {
                console.log("No internet tools used.");
            }

            console.log(`Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}, Prompt: ${prompt}`);
            
            const reply = await module.exports.generateChatCompletion(
                interaction.guild?.id,
                interaction.user.id,
                prompt,
                finalPrompt,
                model,
                interaction.user.username,
                interaction.client
            );
            
            const attachments = await aiAttachment(reply);
            if (attachments) await interaction.editReply({ content: reply, files: attachments });
            else await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply("Can't think now... try again later");
        }    
    }
};

module.exports.generateChatCompletion = async function(serverId, userId, prompt, finalPrompt, model, username = null, client) {
    const history = await getFormattedHistory(serverId, userId, 20);
    const { displayName, identityContext } = createIdentityContext(userId, username, client)

    const messages = [
        { role: "system", content: `${await getContent()}\n\n${identityContext}` },
        ...history,
        { role: "user", name: displayName.toLowerCase().replace(/[^a-z0-9_-]/gi, '_').slice(0, 64), content: displayName + ": " + finalPrompt }
    ];

    try {
        const response = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.9,
        });

        if (response?.choices[0]?.message?.content) {
            let reply = response.choices[0].message.content;
            if (reply.length > 2000) reply = reply.slice(0, 1997) + '...';

            await addHistory(serverId, userId, displayName, displayName + ": " + prompt, "user");
            await addHistory(serverId, userId, "Andrew", "Andrew: " + reply, "assistant");
            
            console.log(`AI response: ${reply}`);
            return reply;
        } else {
            throw new Error("Invalid response structure");
        }
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
};