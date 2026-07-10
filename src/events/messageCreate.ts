import { AttachmentBuilder, Events, Message, MessageFlags } from "discord.js";
import { aiAttachment } from "../aiAttachments.js";
import { gptModel, gptimageModel } from "../aiSettings.js";
import { generateChatCompletion } from "../commands/utility/gpt.js";
import { generateImagePrompt } from "../commands/utility/gptimage.js";
import db from "../db.js";
import { aiGif } from "../gifs.js";
import { getHelloFollowup, getRandomMessage } from "../messageDatabase.js";

export default {
    name: Events.MessageCreate,
    async execute(message: Message) {
        try {
            if (message.author.bot || message.system) return;
            if (message.flags.has(MessageFlags.HasSnapshot)) return;
            if (!message.inGuild()) return;

            console.log(
                `Message from ${message.author.tag} in ${message.guild?.name} - ${message.channel.name}: ${message.content || "[No text]"}`,
            );
            if (message.attachments.size > 0)
                console.log(`Attachments: ${message.attachments.map((a) => a.url).join(", ")}`);

            if (message.author.id === "1014404029146726460") {
                const content = message.content?.trim() || null;

                const { rows: catRows } = await db.query(
                    `SELECT id FROM message_categories WHERE name = 'general' LIMIT 1`,
                );
                if (catRows.length === 0) return;
                const categoryId = catRows[0].id;

                let existingMessage;
                if (content) {
                    const { rows } = await db.query(
                        `SELECT id FROM messages WHERE category_id = $1 AND content = $2`,
                        [categoryId, content],
                    );
                    existingMessage = rows[0];
                } else {
                    const { rows } = await db.query(
                        `SELECT id FROM messages WHERE category_id = $1 AND content IS NULL`,
                        [categoryId],
                    );
                    existingMessage = rows[0];
                }

                let messageId;
                if (!existingMessage) {
                    const result = await db.query(
                        `INSERT INTO messages (category_id, content) VALUES ($1, $2) RETURNING id`,
                        [categoryId, content],
                    );
                    messageId = result.rows[0].id;
                } else {
                    messageId = existingMessage.id;
                }

                if (message.attachments.size > 0) {
                    for (const attachment of message.attachments.values()) {
                        await db.query(
                            `INSERT INTO message_attachments (message_id, file_path)
                            VALUES ($1, $2)
                            ON CONFLICT (message_id, file_path) DO NOTHING`,
                            [messageId, attachment.url],
                        );
                    }
                    console.log(
                        `Added message${content ? ` "${content}"` : ""} with attachments from Andrew to database.`,
                    );
                } else if (!existingMessage) {
                    console.log(
                        `Added message${content ? ` "${content}"` : ""} from Andrew to database.`,
                    );
                }
            }

            const { rows } = await db.query(
                "SELECT id, username, display_name, is_god FROM users WHERE id = $1",
                [message.author.id],
            );
            const god = rows.find((r) => r.is_god);
            const title = god ? (Math.random() < 0.5 ? "god" : "God") : "friend";
            let displayName = rows[0] ? rows[0].display_name : message.author.displayName;
            if (message.author.id === process.env.OWNER2_ID)
                displayName = Math.random() < 0.5 ? "spooked" : "SpookedDoor";

            try {
                if (Math.random() < 0.01) {
                    await message.channel.send(`Hello ${displayName} ${title}`);
                    const followup = await getHelloFollowup(message.author.id);
                    if (followup) await message.channel.send(followup);
                }
            } catch (error) {
                console.error(error);
            }

            const { rows: keywords } = await db.query("SELECT keyword, response FROM keywords");
            const lowerCaseMessage = (message.content || "").toLowerCase();
            const matchedKeywords = keywords.filter(
                (r) => r && r.keyword && lowerCaseMessage.includes(String(r.keyword).toLowerCase()),
            );

            const botWasMentioned = message.mentions.has(message.client.user);
            const triggerWords = ["andrew", "androo"];
            const triggeredByKeyword = triggerWords.some((word) => lowerCaseMessage.includes(word));
            const isReplyToBot =
                message.reference &&
                (await message.fetchReference())?.author?.id === message.client.user.id;
            const triggeredByRealAndrew =
                message.author.id === "1014404029146726460" && lowerCaseMessage.includes("bot");
            const triggered =
                botWasMentioned || triggeredByKeyword || isReplyToBot || triggeredByRealAndrew;

            if (!triggered) {
                try {
                    let categoryMessages = "";
                    const attachments = [];

                    if (matchedKeywords.length > 0) {
                        const seen = new Set();
                        for (const k of matchedKeywords) {
                            const keyword = String(k.keyword).toLowerCase();
                            if (seen.has(keyword)) continue;
                            seen.add(keyword);

                            if (k.response.length === 0) {
                                const msg = await getRandomMessage(keyword);
                                if (msg.content === null) {
                                    const attachment = await aiAttachment(keyword, 1);
                                    if (attachment) attachments.push(...attachment);
                                    continue;
                                }
                                categoryMessages += `${msg.content}\n`;
                            } else {
                                await message.channel.send(k.response);
                            }
                        }
                    }

                    type Payload = {
                        content?: string;
                        files?: AttachmentBuilder[];
                    };

                    const payload: Payload = {};
                    if (categoryMessages.length > 0) payload.content = categoryMessages;
                    if (attachments.length > 0) payload.files = attachments;
                    if (Object.keys(payload).length > 0) await message.channel.send(payload);
                } catch (err) {
                    console.error(err);
                    message.reply("Failed to send message");
                }
            } else {
                try {
                    await message.channel.sendTyping();

                    let prompt = message.content.replace(/<@!?(\d+)>/, "").trim();
                    let finalPrompt = prompt;
                    let model = gptModel;
                    let imageUrl = null;
                    let reply;

                    if (message.attachments.size > 0) imageUrl = message.attachments.first()?.url;
                    if (message.reference) {
                        try {
                            const repliedMessage = await message.fetchReference();
                            if (
                                repliedMessage.attachments.size > 0 &&
                                repliedMessage.author.id !== "1357616229694705796"
                            ) {
                                imageUrl = repliedMessage.attachments.first()?.url;
                            }
                            if (repliedMessage.content) {
                                finalPrompt =
                                    `The user is replying to this message:\n` +
                                    `"${repliedMessage.content}"\n\n` +
                                    `Their reply: ${prompt}`;
                                console.log(
                                    `Replying with context from previous message. ${finalPrompt}`,
                                );
                            }
                        } catch (err) {
                            console.error("Failed to fetch referenced message:", err);
                        }
                    }

                    if (imageUrl) {
                        model = gptimageModel;
                        console.log(
                            `Model used: ${model}, Location: ${message.guild.name} - ${message.channel.name}, Prompt: ${prompt}\nImage URL: ${imageUrl}`,
                        );
                        reply = await generateImagePrompt(
                            message.guild.id,
                            message.author.id,
                            prompt,
                            finalPrompt,
                            imageUrl,
                            message.author.username,
                            message.client,
                        );
                    }

                    if (!reply) {
                        console.log(
                            `Model used: ${model}, Location: ${message.guild.name} - ${message.channel.name}, Prompt: ${prompt}`,
                        );
                        reply = await generateChatCompletion(
                            message.guild.id,
                            message.author.id,
                            prompt,
                            finalPrompt,
                            model,
                            message.author.username,
                            message.client,
                        );
                    }

                    const gif = await aiGif(reply);
                    const attachments = await aiAttachment(reply);

                    attachments
                        ? await message.reply({ content: reply, files: attachments })
                        : await message.reply(reply);
                    if (gif) await message.channel.send(gif);
                } catch (error) {
                    console.error(error);
                    message.reply("Failed to generate AI response");
                }
            }
        } catch (error) {
            console.error("Error in messageCreate event:", error);
        }
    },
};
