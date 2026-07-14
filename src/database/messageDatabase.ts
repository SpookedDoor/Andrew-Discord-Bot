import db from "./db.js";

type MessageRow = {
    id: number;
    category_id: number;
    category: string;
    content: string;
    file_path: string;
    created_at: Date;
};

type Message = {
    content: string | null;
    files?: string[];
};

type MessageMap = Record<string, string[]>;
type CategoryMap = Record<string, string[]>;
type GroupMap = Record<string, Message>;

export async function getMessages(category: string): Promise<Message[]> {
    const { rows } = await db.query<MessageRow>(
        `SELECT m.id, m.content, ma.file_path
        FROM messages m
        LEFT JOIN message_attachments ma ON m.id = ma.message_id
        WHERE m.category_id = (
            SELECT id FROM message_categories WHERE name = $1
        )
        ORDER BY m.id;`,
        [category],
    );

    const grouped: GroupMap = {};
    rows.forEach((row) => {
        if (!grouped[row.id]) {
            grouped[row.id] = {
                content: row.content
                    ? row.content.replace(/\\n/g, "\n").replace("{greeting}", getTimedMessage())
                    : null,
                files: [],
            };
        }
        if (row.file_path) {
            grouped[row.id]?.files?.push(row.file_path);
        }
    });

    return Object.values(grouped);
}

export async function getMessageById(id: number): Promise<string | null> {
    const { rows } = await db.query<{ content: string }>(
        `SELECT content
        FROM messages
        WHERE id = $1
        LIMIT 1;`,
        [id],
    );

    if (rows.length === 0) return null;
    return rows[0]?.content ? rows[0]?.content.replace(/\\n/g, "\n") : null;
}

export async function getRandomMessage(category: string | null = null): Promise<Message> {
    const params: string[] = [];
    let query = `
        SELECT m.id, m.content, ma.file_path
        FROM messages m
        LEFT JOIN message_attachments ma ON m.id = ma.message_id
    `;

    if (category) {
        query += ` WHERE m.category_id = (SELECT id FROM message_categories WHERE name = $1)`;
        params.push(category);
    }

    query += ` ORDER BY RANDOM() LIMIT 1;`;
    const { rows } = await db.query<MessageRow>(query, params);
    if (rows.length === 0) return { content: null, files: [] };

    const message: Message = {
        content: rows[0]?.content
            ? rows[0]?.content.replace(/\\n/g, "\n").replace("{greeting}", getTimedMessage())
            : null,
        files: [],
    };

    rows.forEach((row: MessageRow) => {
        if (row.file_path) message.files?.push(row.file_path);
    });

    return message;
}

export async function getAllMessages(): Promise<MessageMap> {
    const { rows } = await db.query<MessageRow>(`
        SELECT mc.name AS category, m.content
        FROM messages m
        JOIN message_categories mc ON m.category_id = mc.id
        WHERE m.content IS NOT NULL
        ORDER BY mc.id, m.id;
    `);

    const result: MessageMap = {};
    rows.forEach((row) => {
        if (!result[row.category]) result[row.category] = [];
        result[row.category]?.push(row.content.replace(/\\n/g, "\n"));
    });

    return result;
}

function getTimedMessage() {
    return new Date().getUTCHours() < 6
        ? "GN"
        : new Date().getUTCHours() < 12
          ? "morning"
          : new Date().getUTCHours() < 22
            ? "hello"
            : "GN";
}

export function getAge() {
    const birthDate = new Date(2002, 10, 19); // 19 November 2002
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

export async function getHelloFollowup(userId: string) {
    if (Math.random() < 0.5) return null;
    const randomFollowup = await getRandomMessage("hello_followup");
    if (userId === process.env.OWNER2_ID) {
        const options = ["Lefthand", "Righthand", randomFollowup.content];
        return options[Math.floor(Math.random() * options.length)];
    } else {
        return randomFollowup.content;
    }
}

const categoryGroups = {
    batch: new Set([
        "batch",
        "batch2",
        "batch3",
        "batch4",
        "batch5",
        "batch6",
        "batch7",
        "batch8",
        "batch9",
        "batch10",
        "batch11",
        "batch12",
        "batch13",
        "batch14",
        "batch15",
        "do_not_send",
    ]),
};

function normaliseCategory(category: string) {
    for (const [groupName, set] of Object.entries(categoryGroups)) {
        if (set.has(category)) return groupName;
    }
    return category;
}

function sampleArray(arr: string[], n: number): string[] {
    const copy = [...arr];
    const result: string[] = [];
    const size = Math.min(n, copy.length);
    for (let i = 0; i < size; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0] as string);
    }
    return result;
}

function scoreMessage(message: string, prompt: string) {
    const stopWords = new Set([
        "the",
        "a",
        "an",
        "is",
        "are",
        "what",
        "how",
        "do",
        "does",
        "i",
        "you",
        "and",
        "or",
        "of",
        "to",
    ]);

    const promptWords = prompt
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w && !stopWords.has(w));

    const messageWords = new Set(message.toLowerCase().split(/\W+/));

    let score = 0;

    for (const word of promptWords) {
        if (messageWords.has(word)) {
            score++;
        }
    }

    return score;
}

function repetitionPenalty(message: string) {
    const words = message.toLowerCase().split(/\W+/).filter(Boolean);

    const freq = new Map();
    let maxRepeat = 0;

    for (const w of words) {
        const c = (freq.get(w) ?? 0) + 1;
        freq.set(w, c);
        maxRepeat = Math.max(maxRepeat, c);
    }

    if (words.length === 0) return 1;

    const uniqueRatio = new Set(words).size / words.length;

    if (uniqueRatio < 0.4) return 0.2;
    if (maxRepeat > 6) return 0.4;
    if (maxRepeat > 3) return 0.6;

    return 1;
}

function lengthPenalty(message: string) {
    const len = message.length;

    if (len < 50) return 1;
    if (len < 100) return 0.8;
    if (len < 200) return 0.6;
    if (len < 500) return 0.4;
    if (len < 800) return 0.3;

    return 0.2;
}

function isLikelyLyrics(text: string) {
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);
    const uniqueRatio = new Set(words).size / words.length;
    const lineCount = text.split("\n").length;
    return lineCount > 6 && uniqueRatio < 0.55;
}

function pickRelevant(messages: string[], prompt: string, limit: number): string[] {
    const scored = messages.map((message) => {
        const baseScore = scoreMessage(message, prompt);
        const repetition = repetitionPenalty(message);
        const length = lengthPenalty(message);
        const score = baseScore + repetition * 4 + length * 2;

        return {
            message,
            score,
        };
    });

    scored.sort((a, b) => b.score - a.score);

    const topCount = Math.floor(limit * 0.7);
    const top = scored.slice(0, topCount).map((x) => x.message);

    const remaining = scored.slice(topCount).map((x) => x.message);
    const random = sampleArray(remaining, Math.max(0, limit - top.length));

    return [...top, ...random];
}

export async function getSampledMessages({
    prompt,
    samplePerCategory = 20,
    excludedCategories = [],
}: {
    prompt: string;
    samplePerCategory: number;
    excludedCategories: string[];
}) {
    const grouped: CategoryMap = {};
    const result: string[] = [];

    const { rows } = await db.query<MessageRow>(
        `SELECT mc.name AS category, m.content
        FROM messages m
        JOIN message_categories mc ON m.category_id = mc.id
        WHERE m.content IS NOT NULL
        AND mc.name != ALL($1)`,
        [excludedCategories],
    );

    for (const { category, content } of rows) {
        const key = normaliseCategory(category);
        grouped[key] ??= [];
        grouped[key].push(content.replace(/\\n/g, "\n"));
    }

    for (const [category, messages] of Object.entries(grouped)) {
        const limit = category === "general" ? 100 : samplePerCategory;
        if (category === "general") {
            const relevant = pickRelevant(
                messages.filter((m) => !isLikelyLyrics(m)),
                prompt,
                limit,
            );
            result.push(...relevant);
        } else {
            result.push(...sampleArray(messages, limit));
        }
    }

    return result;
}
