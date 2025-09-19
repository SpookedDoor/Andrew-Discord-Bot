const { Events, MessageFlags, AttachmentBuilder } = require('discord.js');
const path = require('node:path');
const { generateChatCompletion } = require('../commands/utility/gpt.js');
const { generateImagePrompt } = require('../commands/utility/gptimage.js');
const { askIfToolIsNeeded } = require('../searchTools.js');
const { braveSearch } = require('../braveSearch.js');
const { googleImageSearch } = require('../googleImageSearch.js');
const { findUserIdentity } = require('../userIdentities.js');
const { gptModel, gptimageModel } = require('../aiSettings.js');
const { getMessageById, getRandomMessage, getHelloFollowup } = require('../messageDatabase.js');
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
            if (activityLevel > 10) helloChance = 0.01; // very active, lower chance - 1%
            else if (activityLevel > 5) helloChance = 0.025; // active, balanced chance - 2.5%
            else if (activityLevel < 3) helloChance = 0.05; // inactive, higher chance - 5%

            if (now - lastGlobal < GLOBAL_HELLO_COOLDOWN) helloChance /= 2;
            if (now - lastUser < HELLO_COOLDOWN) helloChance /= 2;

            console.log(`Message from ${message.author.tag} in ${message.guild.name} - ${message.channel.name}: ${message.content || '[No text]'}`);
            if (message.attachments.size > 0) {
                console.log(`Attachments: ${message.attachments.map(a => a.url).join(', ')}`);
            }

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

            const responses = [
                { keyword: 'hello', match: msg => {const trimmed = msg.trim().toLowerCase();if (trimmed === 'hello') {const now = Date.now();const lastGlobal = lastHelloGlobal.time || 0;const lastUser = lastHelloUser[message.author.id] || 0;if (now - lastGlobal < GLOBAL_HELLO_COOLDOWN || now - lastUser < HELLO_COOLDOWN) return false;lastHelloGlobal.time = now;lastHelloUser[message.author.id] = now;}return trimmed === 'hello' || trimmed === 'hello andrew';},response: `Hello ${displayName} ${title}`},
                { keyword: 'bye', response: 'GN all i am Griffith' },
                { keyword: 'cheese', response: 'https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141', response2: 'This aint cheddar this quiche' },
                { keyword: 'venezuela', response: 'I am from alabama' },
                { keyword: 'fish27.reset()', response: 'hello friends', response2: await getMessageById(1) },
                { keyword: 'kanye', response: await getRandomMessage('kanye') },
                { keyword: 'vultures', response: 'I got no rapper friends i hang whit the vultures' },
                { keyword: 'griffith', response: await getRandomMessage('griffith') },
                { keyword: 'reagan', response: await getRandomMessage('reagan') },
                { keyword: 'nick fuentes', response: await getRandomMessage('nick') },
                { keyword: 'ksi', response: await getRandomMessage('ksi') },
                { keyword: 'mussolini', response: await getRandomMessage('mussolini') },
                { keyword: ' tate', response: await getRandomMessage('tate') },
                { keyword: 'admin', response: 'demoted' },
                { keyword: 'https://tenor.com/view/the-simpsons-bart-shock-electric-chair-gif-12706212', response: 'Me after lobotomy' },
                { keyword: 'oh true', response: 'https://tenor.com/view/oh-true-true-fire-writing-true-fire-true-writing-fire-gif-17199454423395239363' },
                { keyword: 'ezgif-7-f82d4a7d07.gif', response: 'Tomoko haters irl\nRats' },
                { keyword: 'alien x', response: { files: [new AttachmentBuilder(path.join(__dirname, '../media/andrewx.jpg'))] } },
                { keyword: 'https://tenor.com/view/woo-yeah-bunny-no-text-woo-yeah-bunny-woo-yeah-gif-13133555004167092953', response: 'Literally me\nIn school years ago\nThen i become edgy\nThen a discord owner\nThen a ex discord owner\nThen SpookedDoor become my right hand\nThen Trump won\nHappy history' },
                { keyword: 'banana-drew', response: "Pog my own animatronic nickname\nA monkey animatronic from alabama" },
                { keyword: 'evil', response: "I am evil" },
                { keyword: 'wtf', response: { files: [new AttachmentBuilder(path.join(__dirname, '../media/WTF.png'))] } },
                { keyword: 'the nitrous', response: "You are a fucking faggot retard, real Andrew" },
                { keyword: 'leftard', response: "mmfghh i'm a gay cuckservative and i love black cocks" },
                { keyword: 'dirty magazines', response: "I'm gonna force a massive pile of dirt down your throat, you'd like it anyways, considering how many **dirt**y magazines you consume, real Andrew" },
                { keyword: 'i am fried', response: "We know your brain cells are fried, real Andrew" },
                { keyword: 'im fried', response: "We know your brain cells are fried, real Andrew" },
                { keyword: "i'm fried", response: "We know your brain cells are fried, real Andrew" },
                { keyword: 'envy', response: "You envy me\nThe glorious griffith guzzler" },
                { keyword: 'she eat my kids like jared', response: "You are literally an inbred, you will never have kids. Thank God because the last thing we need is more retards like you, real Andrew" },
            ];

            const lowerCaseMessage = message.content.toLowerCase();
            const matchedKeywords = responses.filter(({ keyword, match }) =>
                match ? match(lowerCaseMessage) : lowerCaseMessage.includes(keyword)
            );
            matchedKeywords.sort((a, b) => lowerCaseMessage.indexOf(a.keyword) - lowerCaseMessage.indexOf(b.keyword));

            try {
                if (matchedKeywords.length > 0) {
                    const trimmedContent = message.content.trim().toLowerCase();
                    const isSimpleHello = matchedKeywords.some(({ keyword }) => keyword === 'hello') &&
                        (trimmedContent === 'hello' || trimmedContent === 'hello andrew');

                    for (const { keyword, response, response2 } of matchedKeywords) {
                        message.channel.send(response);
                        if (response2) message.channel.send(response2);

                        if (keyword === 'hello') {
                            const followup = await getHelloFollowup(message.author.id);
                            if (followup) message.channel.send(followup);
                        }
                    }

                    if (isSimpleHello) return;
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
                            if (repliedMessage.attachments.size > 0) {
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

                    const userInfo = await findUserIdentity({ id: message.author.id, name: message.author.displayname, guild: message.guild });
                    const usernameForAI = userInfo?.displayName || message.author.username;

                    if (!reply) {
                        console.log(`Model used: ${model}, Location: ${message.guild.name} - ${message.channel.name}, Prompt: ${prompt}`);
                        reply = await generateChatCompletion(
                            message.author.id,
                            finalPrompt,
                            model,
                            usernameForAI,
                            message.guild
                        );
                        console.log(`AI response: ${reply}`);
                    }

                    const attachments = await aiAttachment(reply);
                    if (reply) {
                        if (attachments) {
                            await message.reply({ content: reply, files: attachments });
                        } else {
                            await message.reply(reply);
                        }
                    }
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