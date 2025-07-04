const { SlashCommandBuilder, MessageFlags } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { baseURL, apiKey, gptModel } = require('../../aiSettings.js');
const OpenAI = require('openai');
const openai = new OpenAI({ 
    baseURL: baseURL,
    apiKey: apiKey
});
const content = require('../../characterPrompt.js');
const { getUserLink } = require('../../lastfmStore');
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
    const authServer = process.env.LASTFM_AUTH_SERVER || 'http://localhost:3001';
    const res = await fetch(`${authServer}/lastfm/user/${userId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.username;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('musicrate')
        .setDescription('Connects with Last.fm and rates your currently playing song'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        let lastfmUsername = await getLinkedLastfmUsername(userId);

        await interaction.deferReply();

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

            // Fetch now playing track
            let track = await getNowPlaying(lastfmUsername);
            let nowPlaying = true;
            if (!track) {
                // If nothing is currently playing, get the most recent track
                const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(lastfmUsername)}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
                const res = await fetch(url);
                const data = await res.json();
                if (!data.recenttracks || !data.recenttracks.track || !data.recenttracks.track[0]) {
                    await interaction.reply({
                        content: `No recent track found for your Last.fm account.`,
                        flags: MessageFlags.Ephemeral
                    });
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

            finalPrompt += "\nDon't mention Kanye unless the song is from him and don't complain if a song isn't Kanye. Make the review positive. Also, give a score out of 10.";

            const aiResponse = await openai.chat.completions.create({
                model: gptModel,
                messages: [
                    { role: 'system', content },
                    { role: 'user', content: finalPrompt }
                ],
                temperature: 0.9
            });

            const aiRating = aiResponse.choices[0]?.message?.content || 'No rating returned.';
            console.log(`Model used: ${gptModel}\nLocation: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}\nPrompt: ${prompt}\nResponse: ${aiRating}`);

            await interaction.editReply({ content: `${nowPlaying ? 'Now playing' : 'Most recent track'}: **${trackInfo}**\nAI rating: ${aiRating}` });
        } catch (error) {
            console.error(error);
            await interaction.editReply("Failed to generate response.");
        }
    },
};