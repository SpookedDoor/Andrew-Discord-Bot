const { SlashCommandBuilder, ActivityType, MessageFlags } = require("discord.js");
const { baseURL, apiKey, gptModel } = require('../../aiSettings.js');
const OpenAI = require('openai');
const openai = new OpenAI({ baseURL, apiKey });
const getContent = require('../../characterPrompt.js');
const { askIfToolIsNeeded } = require('../../searchTools.js');
const { braveSearch } = require('../../braveSearch.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("musicrate")
        .setDescription("Rate the music you're listening to")
        .addUserOption((option) =>
            option.setName("user")
                .setDescription("The user to rate the music of")),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        if (!interaction.guild) return interaction.reply({ content: "This command can only be used in a server I'm in.", flags: MessageFlags.Ephemeral });
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const presence = member.presence;

        if (!presence || presence.activities.length === 0) return interaction.reply({ content: "This user has no active presence.", flags: MessageFlags.Ephemeral });
        const activity = presence.activities.find((a) => a.type === ActivityType.Listening || (a.type === ActivityType.Custom && /listening|music|song/i.test(a.state || a.name)));
        if (!activity) return interaction.reply({ content: "This user is not listening to anything.", flags: MessageFlags.Ephemeral });

        const trackInfo = `${activity.details} - ${activity.state}`
        const prompt = `Rate this song: ${trackInfo}`;
        let finalPrompt = prompt;

        try {
            await interaction.deferReply();

            const toolDecision = await askIfToolIsNeeded(prompt);
            if (toolDecision.startsWith("WEB_SEARCH:")) {
                const query = toolDecision.replace("WEB_SEARCH:", "").trim();
                const webResults = await braveSearch(query);
                finalPrompt = `${prompt}\n\nRelevant web results:\n${webResults}`;
                console.log(`🔍 Web search used with query: "${query}"\n${webResults}`);
            } else {
                console.log("No internet tools used.");
            }

            finalPrompt += "\nIf the song isn't made by Kanye, don't mention Kanye and don't complain if it isn't Kanye. Give a detailed review. Give a score out of 10.";

            const aiResponse = await openai.chat.completions.create({
                model: gptModel,
                messages: [
                    { role: 'system', content: await getContent() },
                    { role: 'user', content: finalPrompt }
                ],
                temperature: 0.9
            });

            const aiRating = aiResponse.choices[0]?.message?.content || 'No rating returned.';
            console.log(`Model used: ${gptModel}\nLocation: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}\nPrompt: ${prompt}\nResponse: ${aiRating}`);

            await interaction.editReply(`Now playing: **${trackInfo}**\nAI rating: ${aiRating}`)
        } catch (error) {
            console.error(error);
            await interaction.editReply("Failed to generate response.");
        }
    },
};