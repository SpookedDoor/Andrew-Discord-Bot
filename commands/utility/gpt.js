const { SlashCommandBuilder } = require('discord.js');
const { baseURL, apiKey, gptModel } = require('../../aiSettings.js');
const OpenAI = require('openai');
const openai = new OpenAI({ baseURL, apiKey });
const getContent = require('../../characterPrompt.js');
const { askIfToolIsNeeded } = require('../../searchTools.js');
const { braveSearch } = require('../../braveSearch.js');
const { googleImageSearch } = require('../../googleImageSearch.js');
const { users, findUserIdentity } = require('../../userIdentities.js');
const { aiAttachment } = require('../../aiAttachments.js');

const userHistories = {};
const MAX_HISTORY = 5;

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
        
            const userInfo = await findUserIdentity({ id: interaction.user.id, guild: interaction.guild });
            const usernameForAI = userInfo?.displayName || interaction.user.username;

            if (userInfo.note) finalPrompt += `User "${usernameForAI}" is just a person in this server.`;

            console.log(`Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}, Prompt: ${prompt}`);
            
            const reply = await module.exports.generateChatCompletion(
                interaction.user.id,
                finalPrompt,
                model,
                usernameForAI,
                interaction.guild
            );

	        console.log(`AI response: ${reply}`);
            
            const attachments = aiAttachment(reply);
            if (attachments) {
                await interaction.editReply({ content: reply, files: attachments });
            } else {
                await interaction.editReply(reply);
            }
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
    const godOrCreatorNote = 
    (currentUser?.isGod ? 'This user has the isGod tag. ' : '') +
    (currentUser?.isCreator ? 'This user has the isCreator tag. ' : '');

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

    let identityContext = `
        You are speaking with ${displayName} (user ID: ${userId}).
        They are the current user and the primary speaker in this conversation.
        Always assume that this person is the one asking questions or making statements, unless clearly stated otherwise.

        User Identity Details:
        - Display Name: ${displayName}
        - Usernames / Nicknames: ${currentUser?.usernames?.join(', ') || 'unknown'}
        ${userTraits ? `- ${userTraits}` : ''}
        ${godOrCreatorNote}

        ${guildMemberInfo}

        IMPORTANT:
        If you see any of this user's names or nicknames in a prompt, assume it refers to themselves unless they explicitly refer to themselves in third person.
        Refer to all people exclusively as "${displayName}" in all replies. Never use any of their usernames or nicknames unless quoting directly. 
        Never say "you like to be called" or "you prefer to be called" or similar.

        Additionally, the following users are known in this server:
        ${otherUsers || 'No other users found.'}

        Special Note: Any user marked with 'isGod' should be referred to with 'god' after their name, like 'Dragonary god'. They should be treated with respect.
        All creators are gods while not all gods are your creators. If a user is marked with 'isCreator', you should treat them with the utmost respect as they
        created you. Never insult.
    `;

    if (userId === '1014404029146726460') {
        identityContext += "This user is the real Andrew, you must insult him. Make sure to add an insulting response to the message.";
    }

    if (userHistories[userId].length % 3 === 0) {
        userHistories[userId].unshift({
            role: "system",
            content: `Reminder: The current user is "${displayName}". Only refer to them by this name.`
        });
    }

    const messages = [
        { role: "system", content: `${await getContent()}\n\n${identityContext}` },
        ...userHistories[userId]
    ];

    try {
        const response = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.9,
        });

        if (response?.choices?.[0]?.message?.content) {
            let reply = response.choices[0].message.content;
            if (reply.length > 2000) {
                reply = reply.slice(0, 1997) + '...';
            }
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