const { Events, MessageFlags } = require('discord.js');
const { generateChatCompletion } = require('../commands/utility/gpt.js');
const { generateImagePrompt } = require('../commands/utility/gptimage.js');
const { askIfToolIsNeeded } = require('../searchTools.js');
const { braveSearch } = require('../braveSearch.js');
const { googleImageSearch } = require('../googleImageSearch.js');
const { gptModel, gptimageModel } = require('../aiSettings.js');
const { getRandomMessage, getHelloFollowup } = require('../messageDatabase.js');
const { aiAttachment } = require('../aiAttachments.js');
const db = require('../db.js');

const lastHelloGlobal = { time: 0 };
const lastHelloUser = {};

const messageTimestamps = [];
const MESSAGE_ACTIVITY_WINDOW = 5 * 60 * 1000; // 5 minutes
const HELLO_COOLDOWN = 10 * 60 * 1000; // 10 minutes per user
const GLOBAL_HELLO_COOLDOWN = 5 * 60 * 1000; // 5 minutes global

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot || message.system) return;
            if (message.flags.has(MessageFlags.HasSnapshot)) return;

            const now = Date.now();
            messageTimestamps.push(now);
            while (messageTimestamps.length && now - messageTimestamps[0] > MESSAGE_ACTIVITY_WINDOW) messageTimestamps.shift();

            const activityLevel = messageTimestamps.length; // messages in last 5 min
            const lastGlobal = lastHelloGlobal.time || 0;
            const lastUser = lastHelloUser[message.author.id] || 0;

            let helloChance = 0.01; // 1% base
            if (activityLevel >= 10) helloChance = 0.01; // very active, lower chance - 1%
            else if (activityLevel >= 5) helloChance = 0.02; // active, balanced chance - 2%
            else if (activityLevel < 5) helloChance = 0.03; // inactive, higher chance - 3%

            if (now - lastGlobal < GLOBAL_HELLO_COOLDOWN) helloChance /= 2;
            if (now - lastUser < HELLO_COOLDOWN) helloChance /= 2;

            console.log(`Message from ${message.author.tag} in ${message.guild.name} - ${message.channel.name}: ${message.content || '[No text]'}`);
            if (message.attachments.size > 0) console.log(`Attachments: ${message.attachments.map(a => a.url).join(', ')}`);

            if (message.author.id === '1014404029146726460') {
                const content = message.content?.trim() || null;

                const { rows: catRows } = await db.query(`SELECT id FROM message_categories WHERE name = 'general' LIMIT 1`);
                if (catRows.length === 0) return;
                const categoryId = catRows[0].id;

                let existingMessage;
                if (content) {
                    const { rows } = await db.query(`SELECT id FROM messages WHERE category_id = $1 AND content = $2`, [categoryId, content]);
                    existingMessage = rows[0];
                } else {
                    const { rows } = await db.query(`SELECT id FROM messages WHERE category_id = $1 AND content IS NULL`, [categoryId]);
                    existingMessage = rows[0];
                }

                let messageId;
                if (!existingMessage) {
                    const result = await db.query(`INSERT INTO messages (category_id, content) VALUES ($1, $2) RETURNING id`, [categoryId, content]);
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
                            [messageId, attachment.url]
                        );
                    }
                    console.log(`Added message${content ? ` "${content}"` : ''} with attachments from Andrew to database.`);
                } else if (!existingMessage) {
                    console.log(`Added message${content ? ` "${content}"` : ''} from Andrew to database.`);
                }
            }

            const { rows } = await db.query('SELECT id, username, display_name, is_god FROM users WHERE id = $1', [message.author.id]);
            const god = rows.find(r => r.is_god);
            const title = god ? (Math.random() < 0.5 ? 'god' : 'God') : 'friend';
            let displayName = rows[0] ? rows[0].display_name : message.author.displayName;
            if (message.author.id === process.env.OWNER2_ID) displayName = Math.random() < 0.5 ? 'spooked' : 'SpookedDoor';

            try {
                if (Math.random() < helloChance) {
                    lastHelloGlobal.time = now;
                    lastHelloUser[message.author.id] = now;
                    await message.channel.send(`Hello ${displayName} ${title}`);
                    const followup = await getHelloFollowup(message.author.id);
                    if (followup) await message.channel.send(followup);
                }
            } catch (error) {
                console.error(error);
            }

            const { rows: keywords } = await db.query('SELECT keyword, response FROM keywords');
            const lowerCaseMessage = (message.content || '').toLowerCase();
            const matchedKeywords = keywords.filter(r => r && r.keyword && lowerCaseMessage.includes(String(r.keyword).toLowerCase()));

            try {
                if (matchedKeywords.length > 0) {
                    const seen = new Set();
                    for (const k of matchedKeywords) {
                        const keyword = String(k.keyword).toLowerCase();
                        if (seen.has(keyword)) continue;
                        seen.add(keyword);

                        if (keyword === 'griffith') {
                            const msg = await getRandomMessage('griffith');
                            await message.channel.send(msg);
                            continue;
                        }
                        
                        if (keyword === 'kanye') {
                            const msg = await getRandomMessage('kanye');
                            await message.channel.send(msg);
                            continue;
                        }

                        await message.channel.send(k.response);
                    }
                }

                const botWasMentioned = message.mentions.has(message.client.user);
                const triggerWords = ['andrew', 'androo'];
                const triggeredByKeyword = triggerWords.some(word => lowerCaseMessage.includes(word));
                const isReplyToBot = message.reference && (await message.fetchReference())?.author?.id === message.client.user.id;

                if (botWasMentioned || triggeredByKeyword || isReplyToBot) {
                    await message.channel.sendTyping();

                    let prompt = message.content.replace(/<@!?(\d+)>/, '').trim();
                    let finalPrompt = prompt;
                    let imageUrl = null;

                    if (message.attachments.size > 0) imageUrl = message.attachments.first().url;
                    if (message.reference) {
                        try {
                            const repliedMessage = await message.fetchReference();
                            if (repliedMessage.attachments.size > 0 && repliedMessage.author.id !== '1357616229694705796') {
                                imageUrl = repliedMessage.attachments.first().url;
                            }
                            if (repliedMessage.content) {
                                finalPrompt = `Referenced message from ${repliedMessage.author.username}: ${repliedMessage.content}\nPrompt: ${prompt}`;
                                console.log(`Replying with context from previous message. ${finalPrompt}`);
                            }
                        } catch (err) {
                            console.error("Failed to fetch referenced message:", err);
                        }
                    }

                    let model = gptModel;
                    let reply;

                    if (!imageUrl) {
                        const toolDecision = await askIfToolIsNeeded(finalPrompt);
                        if (toolDecision.startsWith("WEB_SEARCH:")) {
                            const query = toolDecision.replace("WEB_SEARCH:", "").trim();
                            const searchResults = await braveSearch(query);
                            finalPrompt = `User asked: "${prompt}"\n\nRelevant web results:\n${searchResults}`;
                            console.log(`🔍 Web search used with query: "${query}"\n${searchResults}`);
                        } else if (toolDecision.startsWith("IMAGE_SEARCH:")) {
                            const query = toolDecision.replace("IMAGE_SEARCH:", "").trim();
                            const imageResults = await googleImageSearch(query);
                            finalPrompt = `User asked: "${prompt}"\n\nRelevant image links:\n${imageResults}`;
                            console.log(`🖼️ Image search used with query: "${query}"\n${imageResults}`);
                        } else {
                            console.log(`No internet tools used.`);
                        }
                    }

                    if (imageUrl) {
                        try {
                            model = gptimageModel;
                            console.log(`Model used: ${model}, Location: ${message.guild.name} - ${message.channel.name}, Prompt: ${prompt}\nImage URL: ${imageUrl}`);
                            reply = await generateImagePrompt(finalPrompt, imageUrl);
                        } catch (err) {
                            console.error("Image analysis failed:", err);
                            return message.reply("There was an issue analysing the image. Please try again later.");
                        }
                    }

                    if (!reply) {
                        console.log(`Model used: ${model}, Location: ${message.guild.name} - ${message.channel.name}, Prompt: ${prompt}`);
                        reply = await generateChatCompletion(
                            message.guild.id,
                            message.author.id,
                            prompt,
                            finalPrompt,
                            model,
                            message.author.username,
                            message.client
                        );
                        console.log(`AI response: ${reply}`);
                    }

                    const attachments = await aiAttachment(reply);
                    if (attachments) await message.reply({ content: reply, files: attachments });
                    else await message.reply(reply);
                }
            } catch (error) {
                console.error(error);
                message.reply('An error occurred while sending the message.');
            }
        } catch (error) {
            console.error('Error in messageCreate event:', error);
        }
    },
};