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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('musicrate')
        .setDescription('Connects with Last.fm and rates your currently playing song'),
    async execute(interaction) {
        const userId = interaction.user.id;
        let lastfmUsername = getUserLink(userId);

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
        await interaction.deferReply();
        const aiResponse = await openai.chat.completions.create({
            model: gptModel,
            messages: [
                { role: 'system', content },
                { role: 'user', content: prompt }
            ],
            temperature: 0.9
        });
        const aiRating = aiResponse.choices[0]?.message?.content || 'No rating returned.';

        await interaction.editReply({
            content: `${nowPlaying ? 'Now playing' : 'Most recent track'}: **${trackInfo}**\nAI rating: ${aiRating}`
        });
    },
};