const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const axios = require("axios");

const MIN_SCORE = 100;
const BLACKLISTED_TAGS = [
    "ai_generated",
    "anal_spreader",
    "bestiality",
    "castration",
    "cbt",
    "cheating",
    "cock_and_ball_torture",
    "cock_and_balls_torture",
    "cock_vore",
    "cub",
    "cuck",
    "cuckold",
    "dittochad",
    "egg_implantation",
    "egg_laying",
    "fart",
    "fat",
    "feral",
    "gore",
    "hairy_nipples",
    "horsecock",
    "hyper",
    "hyper_penis",
    "lgbt_pride",
    "netorare",
    "ntr",
    "obese",
    "old_man",
    "penectomy",
    "picturd",
    "pride_colors",
    "scat",
    "smegma",
    "snickerz",
    "torture",
    "transgender",
    "urethral_insertion",
    "urethral_penetration",
    "vomit",
    "vore_belly",
];

const GELBOORU_BASE = "https://gelbooru.com/index.php";

function getGelbooruAuthParams() {
    const apiKey = process.env.GELBOORU_API_KEY;
    const userId = process.env.GELBOORU_USER_ID;

    if (apiKey && userId) return { api_key: apiKey, user_id: userId };
    return {};
}

function pickRandomDistinct(arr, n) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(n, copy.length));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gelbooru")
        .setDescription("Fetches random images from Gelbooru based on the given tags")
        .addStringOption((option) =>
            option
                .setName("tags")
                .setDescription("Tags to search for (space-separated)")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('rating')
                .setDescription('Filter by rating')
                .setRequired(false)
                .addChoices(
                    { name: 'General', value: 'g' },
                    { name: 'Sensitive', value: 's' },
                    { name: 'Questionable', value: 'q' },
                    { name: 'Explicit', value: 'e' }
                )
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        if (!focusedValue) return interaction.respond([]);

        const parts = focusedValue.split(" ");
        const lastTag = parts.pop() ?? "";
        const prefix = parts.join(" ");

        if (!lastTag.trim()) return interaction.respond([]);

        try {
            const params = {
                page: "dapi",
                s: "tag",
                q: "index",
                json: 1,
                name_pattern: `${lastTag}%`,
                orderby: "count",
                order: "DESC",
                limit: 20,
                ...getGelbooruAuthParams(),
            };

            const { data } = await axios.get(GELBOORU_BASE, { params });

            const tags = Array.isArray(data?.tag) ? data.tag : [];

            const suggestions = tags
                .map((t) => t?.name)
                .filter(Boolean)
                .filter((name) => !BLACKLISTED_TAGS.includes(name))
                .slice(0, 10)
                .map((name) => ({
                    name: prefix ? `${prefix} ${name}` : name,
                    value: prefix ? `${prefix} ${name}` : name,
                }));

            return interaction.respond(suggestions);
        } catch (err) {
            console.error(
                "Gelbooru autocomplete error:",
                err?.response?.data ?? err,
            );
            return interaction.respond([]);
        }
    },

    async execute(interaction) {
        const tagsInput = interaction.options.getString("tags")?.trim();
        const rating = interaction.options.getString('rating');

        if (!tagsInput) {
            return interaction.reply({
                content: "❌ Please provide tags.",
                flags: MessageFlags.Ephemeral,
            });
        }

        let queryTags = `${tagsInput} sort:score`;
        if (rating) queryTags += ` rating:${rating}`;

        try {
            const params = {
                page: "dapi",
                s: "post",
                q: "index",
                json: 1,
                tags: queryTags,
                limit: 100,
                pid: 0,
                ...getGelbooruAuthParams(),
            };

            const { data } = await axios.get(GELBOORU_BASE, { params });

            let posts = Array.isArray(data?.post) ? data.post : [];

            if (!posts.length) {
                return interaction.reply({
                    content: "❌ No images found for the given tags.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            posts = posts.filter((post) => {
                if (!post) return false;

                const tagString = post.tags ?? "";
                const tagsArray = tagString.split(" ").filter(Boolean);

                const hasBlacklistedTag = tagsArray.some((tag) =>
                    BLACKLISTED_TAGS.includes(tag),
                );
                if (hasBlacklistedTag) return false;

                const score = Number.parseInt(post.score ?? "0", 10);
                if (Number.isNaN(score) || score < MIN_SCORE) return false;

                if (!post.file_url && !post.source) return false;

                return true;
            });

            if (!posts.length) {
                return interaction.reply({
                    content: "❌ No suitable images found after filtering.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const picked = pickRandomDistinct(posts, 5);

            const urls = picked
                .map((p) => p.file_url || p.source)
                .filter(Boolean);

            return interaction.reply({ content: urls.join("\n") });
        } catch (err) {
            console.error("Gelbooru fetch error:", err?.response?.data ?? err);
            return interaction.reply({
                content: "⚠️ Error fetching data from Gelbooru.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};