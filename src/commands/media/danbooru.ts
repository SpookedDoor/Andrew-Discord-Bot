import { search } from "booru";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js";

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
    "horsecock",
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
    "vore_belly",
    "loli",
    "shota",
];

export default {
    data: new SlashCommandBuilder()
        .setName("danbooru")
        .setDescription("Fetches random images from danbooru based on the given tags")
        .addStringOption((option) =>
            option
                .setName("tags")
                .setDescription("Tags to search for (comma-separated)")
                .setRequired(true)
                .setAutocomplete(true),
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused();
        if (!focusedValue) return interaction.respond([]);
        const parts = focusedValue.split(",");
        const lastTag = parts.pop()?.trim() as string;
        const prefix = parts.join(", ");

        try {
            const res: { name: string }[] = await fetch(
                `https://danbooru.donmai.us/tags.json?search[name_matches]=${encodeURIComponent(lastTag)}*&search[order]=count`,
            ).then((r) => r.json());
            const tags = res.filter((t) => !BLACKLISTED_TAGS.includes(t.name));

            await interaction.respond(
                tags.slice(0, 10).map((t) => ({
                    name: prefix ? `${prefix}, ${t.name}` : t.name,
                    value: prefix ? `${prefix}, ${t.name}` : t.name,
                })),
            );
        } catch (err) {
            console.error("Autocomplete error:", err);
            return interaction.respond([]);
        }
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const tags = interaction.options.getString("tags") as string;

        try {
            const posts = await search("danbooru", tags.split(","), { limit: 100, random: true });

            if (posts.length === 0) {
                return interaction.reply({
                    content: "❌ No images found for the given tags.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const filtered = posts.filter((post) => {
                if (!post || !post.tags) return false;
                const hasBlacklistedTag = post.tags.some((tag) => BLACKLISTED_TAGS.includes(tag));
                const passesScore = post.score >= MIN_SCORE;
                return !hasBlacklistedTag && passesScore;
            });

            if (filtered.length === 0) {
                return interaction.reply({
                    content: "❌ No suitable images found after filtering.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const urls = filtered.slice(0, 5).map((post) => post.fileUrl);
            return interaction.reply({ content: urls.join("\n") });
        } catch (err) {
            console.error("Danbooru fetch error:", err);
            return interaction.reply({
                content: "⚠️ Error fetching data from Danbooru.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
