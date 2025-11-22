const { SlashCommandBuilder, ActivityType, MessageFlags } = require("discord.js");
const { baseURL, apiKey, gptModel } = require('../../aiSettings.js');
const OpenAI = require('openai');
const openai = new OpenAI({ baseURL, apiKey });
const getContent = require('../../characterPrompt.js');
const { askIfToolIsNeeded } = require('../../searchTools.js');
const { braveSearch } = require('../../braveSearch.js');

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

async function getNowPlaying(username) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.recenttracks || !data.recenttracks.track || !data.recenttracks.track[0]) return null;
    const track = data.recenttracks.track[0];
    if (!track['@attr'] || !track['@attr'].nowplaying) return null;
    return track;
}

// Helper to get Last.fm username from remote auth server
async function getLinkedLastfmUsername(userId) {
    try {
        const authServer = process.env.LASTFM_AUTH_SERVER || 'http://localhost:3001';
        const res = await fetch(`${authServer}/lastfm/user/${userId}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.username;
    } catch (error) {
        console.error('Error getting Last.fm username:', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("musicrate")
        .setDescription("Rate the music you're listening to")
        .addSubcommand(subcommand =>
            subcommand.setName("status")
            .setDescription("Rate the music you're listening to")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription("The user to rate the music of")))
        .addSubcommand(subcommand =>
            subcommand.setName("lastfm")
            .setDescription("Rate the music you're listening to on Last.fm")),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === "lastfm") {
            const userId = interaction.user.id;
            let lastfmUsername = await getLinkedLastfmUsername(userId);

            try {
                if (!lastfmUsername) {
                    // Not linked: send OAuth link with callback and userId
                    const authServer = process.env.LASTFM_AUTH_SERVER || 'http://localhost:3001';
                    const callbackUrl = `${authServer}/lastfm/callback?userId=${userId}`;
                    const authUrl = `https://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&cb=${encodeURIComponent(callbackUrl)}`;
                    await interaction.reply({
                        content: `You need to link your Last.fm account first. [Connect your account](${authUrl}) and then try again.\nAfter authorising, your account will be linked automatically.`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                await interaction.deferReply();

                // Fetch now playing track
                let track = await getNowPlaying(lastfmUsername);
                let nowPlaying = true;
                if (!track) {
                    // If nothing is currently playing, get the most recent track
                    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(lastfmUsername)}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (!data.recenttracks || !data.recenttracks.track || !data.recenttracks.track[0]) {
                        await interaction.editReply("No recent track found for your Last.fm account.");
                        return;
                    }
                    track = data.recenttracks.track[0];
                    nowPlaying = false;
                }

                const trackInfo = `${track.artist['#text']} - ${track.name}`;
                const prompt = `Rate this song: ${trackInfo}`;
                let finalPrompt = prompt;

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

                await interaction.editReply(`${nowPlaying ? 'Now playing' : 'Most recent track'}: **${trackInfo}**\nAI rating: ${aiRating}`);
            } catch (error) {
                console.error(error);
                await interaction.editReply("Failed to generate response.");
            }
        } else if (interaction.options.getSubcommand() === "status") {
            const user = interaction.options.getUser("user") || interaction.user;
            if (!interaction.guild) return interaction.reply({ content: "This command can only be used in a server I'm in.", flags: MessageFlags.Ephemeral });
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            const presence = member.presence;

            if (!presence || presence.activities.length === 0) return interaction.reply({ content: "This user has no active presence.", flags: MessageFlags.Ephemeral });
            const activity = presence.activities.find((a) => a.type === ActivityType.Listening || (a.type === ActivityType.Custom && /listening|music|song/i.test(a.state || a.name)));
            if (!activity) return interaction.reply({ content: "This user is not listening to anything.", flags: MessageFlags.Ephemeral });

            const trackInfo = `${activity.state} - ${activity.details}`
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
        }
    },
};