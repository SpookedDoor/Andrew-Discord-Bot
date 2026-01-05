const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');

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
    "guro",
    "hairy_nipples",
    "horse_penis",
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
    "vore_belly"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('danbooru')
        .setDescription('Fetches random images from danbooru based on the given tags')
        .addStringOption(option =>
            option.setName('tags')
                .setDescription('Tags to search for (space-separated)')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        if (!focusedValue) return interaction.respond([]);
        const parts = focusedValue.split(" ");
        const lastTag = parts.pop();
        const prefix = parts.join(" ");

        try {
            const response = await axios.get(`https://danbooru.donmai.us/tags.json?search[name_matches]=${encodeURIComponent(lastTag)}*&search[order]=count`);
            let suggestions = response.data;

            suggestions = suggestions.filter(s => !BLACKLISTED_TAGS.includes(s.name));

            await interaction.respond(
                suggestions.slice(0, 10).map(tag => ({
                    name: prefix ? `${prefix} ${tag.name}` : tag.name,
                    value: prefix ? `${prefix} ${tag.name}` : tag.name
                }))
            );
        } catch (err) {
            console.error("Autocomplete error:", err);
            return interaction.respond([]);
        }
    },
        async execute(interaction) {
        const tags = interaction.options.getString('tags');
        const url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(tags + " order:score")}&limit=200`;
        
        try {
            const response = await axios.get(url);
            let data = response.data;

            if (!data || data.length === 0) return interaction.reply({ content: '❌ No images found for the given tags.', flags: MessageFlags.Ephemeral });

            data = data.filter(post => {
                if (!post || !post.tag_string) return false;

                const tagsArray = post.tag_string.split(" ");
                const hasBlacklistedTag = tagsArray.some(tag => BLACKLISTED_TAGS.includes(tag));
                const passesScore = parseInt(post.score, 10) >= MIN_SCORE;

                return !hasBlacklistedTag && passesScore;
            });

            if (data.length === 0) return interaction.reply({ content: '❌ No suitable images found after filtering.', flags: MessageFlags.Ephemeral });

            let posts = [];
            for (let i = 0; i < 5 && data.length > 0; i++) {
                const post = data[Math.floor(Math.random() * data.length)];
                if (!posts.includes(post)) posts.push(post);
            }

            const urls = posts.map(post => post.file_url);
            return interaction.reply({ content: urls.join('\n') });
        } catch (err) {
            console.error("Danbooru fetch error:", err);
            return interaction.reply({ content: '⚠️ Error fetching data from Danbooru.', flags: MessageFlags.Ephemeral });
        }
    },
};