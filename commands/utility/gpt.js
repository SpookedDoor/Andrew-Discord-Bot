const { SlashCommandBuilder } = require('discord.js');
const { openai, gptModel } = require('../../aiSettings.js');
const getContent = require('../../characterPrompt.js');
const { aiAttachment } = require('../../aiAttachments.js');
const { createIdentityContext } = require('../../userIdentities.js');
const { getFormattedHistory, addHistory } = require('../../dbHistoryUtils.js');
const { cleanReply } = require('../../cleanReply.js');
const { aiGif } = require('../../gifs.js');

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

            console.log(`Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}, Prompt: ${prompt}`);
            
            const reply = await module.exports.generateChatCompletion(
                interaction.guild?.id,
                interaction.user.id,
                prompt,
                prompt,
                model,
                interaction.user.username,
                interaction.client
            );
            
            const gif = await aiGif(reply);
            const attachments = await aiAttachment(reply);

            attachments ? await interaction.editReply({ content: reply, files: attachments }) : await interaction.editReply(reply);
            if (gif) interaction.guild ? await interaction.channel.send(gif) : await interaction.followUp(gif);
        } catch (err) {
            console.error(err);
            await interaction.editReply("Failed to generate AI response");
        }    
    }
};

module.exports.generateChatCompletion = async function(serverId, userId, prompt, finalPrompt, model, username = null, client) {
    const history = await getFormattedHistory(serverId, userId, 10);
    const { displayName, identityContext } = await createIdentityContext(userId, username, client);

    const messages = [
        { role: "system", content: `${await getContent(finalPrompt)}\n\n${identityContext}` },
        ...history,
        { role: "user", content: displayName + ": " + finalPrompt }
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
};
