import {
    ActivityType,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import { gptModel, openai } from "../../ai/aiSettings.js";
import getContent from "../../ai/characterPrompt.js";
import { cleanReply } from "../../utils/cleanReply.js";

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

type LastFMTrack = {
    artist: {
        "#text": string;
    };
    album: {
        "#text": string;
    };
    name: string;
    "@attr": {
        nowplaying: boolean;
    };
};

type TrackInfo = {
    name: string;
    listeners: number;
    playcount: number;
    artist: {
        name: string;
    };
    album: {
        artist: string;
        title: string;
    };
    toptags: {
        tag: {
            name: string;
        }[];
    };
    wiki: {
        summary: string;
        content: string;
    };
};

async function getTrack(username: string) {
    const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${LASTFM_API_KEY}&format=json&limit=1`,
    );
    const data = await res.json();
    const track = data?.recenttracks?.track?.[0] as LastFMTrack;
    if (!track) return null;
    const nowPlaying = !!track["@attr"]?.nowplaying;
    return { track, nowPlaying };
}

async function getTrackInfo(artist: string, track: string): Promise<TrackInfo | null> {
    const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json&limit=1`,
    );
    const data = await res.json();
    if (!data.track) return null;
    return data.track;
}

function getTags(trackData: TrackInfo) {
    const tags = trackData?.toptags?.tag;
    if (!tags) return "";
    const tagArray = Array.isArray(tags) ? tags : [tags];
    return tagArray
        .map((t) => t.name)
        .filter(Boolean)
        .join(", ");
}

function getSummary(trackData: TrackInfo) {
    const summary = trackData?.wiki?.summary;
    if (!summary) return "";
    return summary;
}

function cleanArtist(artist: string) {
    return (artist.split(";")[0] as string).trim();
}

async function getRelevantInfo(artist: string, track: string): Promise<string | null> {
    const trackData = await getTrackInfo(cleanArtist(artist), track);
    if (!trackData) return null;

    const listeners = trackData.listeners;
    const playcount = trackData.playcount;

    const tags = getTags(trackData);
    const summary = getSummary(trackData);

    return [
        "Track Info:",
        `Listeners: ${listeners}`,
        `Total Playcount: ${playcount}`,
        tags ? `Tags: ${tags}` : null,
        summary ? `Summary: ${summary}` : null,
    ]
        .filter(Boolean)
        .join("\n");
}

async function getLinkedLastfmUsername(userId: string) {
    try {
        const authServer = process.env.LASTFM_AUTH_SERVER || "http://localhost:3001";
        const res = await fetch(`${authServer}/lastfm/user/${userId}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.username;
    } catch (error) {
        console.error("Error getting Last.fm username:", error);
        return null;
    }
}

async function rateSong(trackInfo: string, extraInfo: string | null) {
    const prompt = `Rate this song: ${trackInfo}`;

    const finalPrompt = [
        prompt,
        `If the song isn't made by Kanye, don't mention Kanye and don't complain if it isn't Kanye. Don't mention playcount. 
        You can comment on popularity though. Give a detailed review. Give a score out of 10.`,
        extraInfo,
    ]
        .filter(Boolean)
        .join("\n");

    const response = await openai.chat.completions.create({
        model: gptModel,
        messages: [
            { role: "system", content: await getContent(prompt) },
            { role: "user", content: finalPrompt },
        ],
        temperature: 0.8,
    });

    const content = response?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        console.error("Invalid AI response:", JSON.stringify(response, null, 2));
        throw new Error("Empty or invalid AI response");
    }

    return cleanReply(content || "No rating");
}

export default {
    data: new SlashCommandBuilder()
        .setName("musicrate")
        .setDescription("Rate the music you're listening to")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("status")
                .setDescription("Rate the music you're listening to")
                .addUserOption((option) =>
                    option.setName("user").setDescription("The user to rate the music of"),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("lastfm")
                .setDescription("Rate the music you're listening to on Last.fm"),
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        if (interaction.options.getSubcommand() === "lastfm") {
            const userId = interaction.user.id;
            const lastfmUsername = await getLinkedLastfmUsername(userId);

            if (!lastfmUsername) {
                const authServer = process.env.LASTFM_AUTH_SERVER || "http://localhost:3001";
                const callbackUrl = `${authServer}/lastfm/callback?userId=${userId}`;
                const authUrl = `https://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&cb=${encodeURIComponent(callbackUrl)}`;
                await interaction.reply({
                    content: `You need to link your Last.fm account first. [Connect your account](${authUrl}) and then try again.\nAfter authorising, your account will be linked automatically.`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const result = await getTrack(lastfmUsername);
            if (!result) {
                await interaction.reply("No recent track found.");
                return;
            }

            const { track, nowPlaying } = result;

            const trackInfo = `${track.artist["#text"]} - ${track.name}`;
            const extraInfo = await getRelevantInfo(track.artist["#text"], track.name);

            try {
                await interaction.deferReply();
                const aiRating = await rateSong(trackInfo, extraInfo);
                console.log(
                    `Model used: ${gptModel}, Location: ${
                        interaction.guild && interaction.channel instanceof TextChannel
                            ? `${interaction.guild.name} - ${interaction.channel.name}`
                            : `${interaction.user.username} - DM`
                    }, Response: ${aiRating}`,
                );
                await interaction.editReply(
                    `${nowPlaying ? "Now playing" : "Most recent track"}: **${trackInfo}**\nAI rating: ${aiRating}`,
                );
            } catch (error) {
                console.error(error);
                await interaction.editReply("Failed to generate AI response");
            }
        } else if (interaction.options.getSubcommand() === "status") {
            const user = interaction.options.getUser("user") || interaction.user;

            if (!interaction.guild) {
                return interaction.reply({
                    content: "This command can only be used in a server I'm in.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            const presence = member?.presence;

            if (!presence || presence.activities.length === 0) {
                return interaction.reply({
                    content: "This user has no active presence.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const activity = presence.activities.find(
                (a) =>
                    a.type === ActivityType.Listening ||
                    (a.type === ActivityType.Custom &&
                        /listening|music|song/i.test(a.state || a.name)),
            );

            if (!activity) {
                return interaction.reply({
                    content: "This user is not listening to anything.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const trackInfo = `${activity.state} - ${activity.details}`;
            const extraInfo = await getRelevantInfo(
                activity.state as string,
                activity.details as string,
            );

            try {
                await interaction.deferReply();
                const aiRating = await rateSong(trackInfo, extraInfo);
                console.log(
                    `Model used: ${gptModel}, Location: ${
                        interaction.guild && interaction.channel instanceof TextChannel
                            ? `${interaction.guild.name} - ${interaction.channel.name}`
                            : `${interaction.user.username} - DM`
                    }, Response: ${aiRating}`,
                );
                await interaction.editReply(
                    `Now playing: **${trackInfo}**\nAI rating: ${aiRating}`,
                );
            } catch (error) {
                console.error(error);
                await interaction.editReply("Failed to generate AI response");
            }
        }
    },
};
