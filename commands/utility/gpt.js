const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({ 
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: process.env.OPENROUTER_API_KEY 
});
const content = require('../../characterPrompt.js');
const { braveSearch } = require('../../braveSearch.js');
const { braveImageSearch } = require('../../braveImageSearch.js');

const { users, findUserIdentity } = require('../../userIdentities.js');

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
                    { name: 'Deepseek V3', value: 'deepseek/deepseek-chat-v3-0324:free' },
                    { name: 'Llama 4 Scout', value: 'meta-llama/llama-4-scout:free' },
                    { name: 'Llama 4 Maverick', value: 'meta-llama/llama-4-maverick:free' },
                    { name: 'Llama 3.1 Nemotron Ultra', value: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free' },
                    { name: 'Mistral Small 3.1', value: 'mistralai/mistral-small-3.1-24b-instruct:free' },
                    { name: 'Google Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-exp:free' },
                    { name: 'Google Gemma 3', value: 'google/gemma-3-27b-it:free' },
                    { name: 'Qwen 2.5', value: 'qwen/qwen2.5-vl-72b-instruct:free' },
                )),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const model = interaction.options.getString('model') ? interaction.options.getString('model') : 'meta-llama/llama-4-scout:free';

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
        
            const userInfo = await findUserIdentity({ id: interaction.user.id, guild: interaction.guild });
            const usernameForAI = userInfo?.displayName || interaction.user.username;

            if (userInfo.note) finalPrompt += `User "${usernameForAI}" is just a person in this server.`;

            const reply = await module.exports.generateChatCompletion(
                interaction.user.id,
                finalPrompt,
                model,
                usernameForAI
            );

	        console.log(`AI response: ${reply}`);

            await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply("Can't think now... try again later");
        }    
    }
};

module.exports.generateChatCompletion = async function(userId, prompt, model, username = null, guild = null) {
    if (!userHistories[userId]) userHistories[userId] = [];
    userHistories[userId].push({ role: "user", content: prompt });
    userHistories[userId] = userHistories[userId].slice(-MAX_HISTORY);

    const currentUser = await findUserIdentity({ id: userId, name: username, guild });
    const displayName = currentUser?.displayName || username || "this user";
    const userTraits = currentUser?.traits?.length ? `Traits: ${currentUser.traits.join(', ')}` : '';

    const otherUsers = users
        .filter(u => u.id !== userId)
        .map(u => {
            const nicknames = u.usernames.join(', ');
            const creatorTag = u.isCreator ? ' [Creator]' : '';
            const godTag = u.isGod ? ' [God]' : '';
            const traits = u.traits?.length ? ` | Traits: ${u.traits.join(', ')}` : '';
            return `- ${u.displayName} (nicknames: ${nicknames})${creatorTag}${godTag}${traits}`;
        })
        .join('\n');

    function getGuildDisplayNames(guild, excludeId = null, limit = 25) {
        const members = guild.members.cache
            .filter(m => !m.user.bot && m.id !== excludeId)
            .map(m => `- ${m.displayName} (${m.user.username})`);
        return members.slice(0, limit).join('\n');
    }

    let guildMemberInfo = '';
    if (guild?.members?.cache?.size) {
        const member = guild.members.cache.get(userId);
        const roles = member?.roles?.cache
            ? member.roles.cache
                .map(role => role.name)
                .filter(r => r !== '@everyone')
                .join(', ')
            : 'None';
        const allDisplayNames = getGuildDisplayNames(guild, userId);

        guildMemberInfo = `
            Guild-Specific Info:
            - Server Name: ${guild.name}
            - Member Display Name: ${member?.displayName || 'unknown'}
            - Roles: ${roles || 'None'}
            - Other Members: ${allDisplayNames}
        `;
    }

    const identityContext = `
        You are speaking with ${displayName} (user ID: ${userId}).
        They are the current user and the primary speaker in this conversation.
        Always assume that this person is the one asking questions or making statements, unless clearly stated otherwise.

        User Identity Details:
        - Display Name: ${displayName}
        - Usernames / Nicknames: ${currentUser?.usernames?.join(', ') || 'unknown'}
        ${userTraits ? `- ${userTraits}` : ''}

        ${guildMemberInfo}

        IMPORTANT:
        If you see any of this user's names or nicknames in a prompt, assume it refers to themselves unless they explicitly refer to themselves in third person.
        Refer to all people exclusively as "${displayName}" in all replies. Never use any of their usernames or nicknames unless quoting directly. 
        Never say "you like to be called" or "you prefer to be called" or similar.

        Additionally, the following users are known in this server:
        ${otherUsers || 'No other users found.'}

        Special Note: Any user marked with 'isGod' should be referred to with 'god' after their name, like 'Dragonary god'. 
        All creators are gods while not all gods are your creators.
    `;

    if (userHistories[userId].length % 3 === 0) {
        userHistories[userId].unshift({
            role: "system",
            content: `Reminder: The current user is "${displayName}". Only refer to them by this name.`
        });
    }

    const messages = [
        { role: "system", content: `${content}\n\n${identityContext}` },
        ...userHistories[userId]
    ];

    try {
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
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
};
