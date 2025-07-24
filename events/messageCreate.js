const { Events, MessageFlags, AttachmentBuilder } = require('discord.js');
const path = require('node:path');
const status = require('../setSleep.js');
const { generateChatCompletion } = require('../commands/utility/gpt.js');
const { generateImagePrompt } = require('../commands/utility/gptimage.js');
const { askIfToolIsNeeded } = require('../searchTools.js');
const { braveSearch } = require('../braveSearch.js');
const { braveImageSearch } = require('../braveImageSearch.js');
const { googleImageSearch } = require('../googleImageSearch.js');
const { findUserIdentity } = require('../userIdentities.js');
const { gptModel, gptimageModel } = require('../aiSettings.js');
const { emojis, griffith_messages, kanye_messages, reagan_messages, nick_messages, ksi_messages, mussolini_messages, tate_messages } = require('../messageDatabase.js');
const { aiAttachment } = require('../aiAttachments.js');

const gods = [
    { user: 'thedragonary', display: 'dragonary' },
    { user: 'spookeddoor', display: 'spookeddoor' },
    { user: 'hellbeyv2', display: 'hellbey' },
    { user: 'sillyh.', display: 'trinke' },
    { user: 'nonamebadass', display: 'poncho' },
	{ user: 'marv_mari', display: 'brit' },
];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || message.system) return;
        if (message.flags.has(MessageFlags.HasSnapshot)) return;

        console.log(`Message from ${message.author.tag} in ${message.guild.name} - ${message.channel.name}: ${message.content || '[No text]'}`);
        if (message.attachments.size > 0) {
            console.log(`Attachments: ${message.attachments.map(a => a.url).join(', ')}`);
        }

        const god = gods.find(g =>
            message.author.username.toLowerCase().includes(g.user.toLowerCase()) ||
            (message.member && message.member.displayName.toLowerCase().includes(g.display.toLowerCase()))
        );
        const title = god ? 'god' : 'friend';

        const responses = [
            { keyword: 'hello', response: `hello ${god ? god.display : message.author.displayName} ${title}` },
            { keyword: 'bye', response: 'GN all i am Griffith' },
            { keyword: 'cheese', response: 'https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141', response2: 'This aint cheddar this quiche' },
            { keyword: 'venezuela', response: 'I am from alabama' },
            { keyword: 'fish27.reset()', response: 'hello friends', response2: emojis[0] },
            { keyword: 'kanye', response: kanye_messages[Math.floor(Math.random() * kanye_messages.length)] },
            { keyword: 'vultures', response: 'I got no rapper friends i hang whit the vultures' },
            { keyword: 'griffith', response: griffith_messages[Math.floor(Math.random() * griffith_messages.length)] },
            { keyword: 'reagan', response: reagan_messages[Math.floor(Math.random() * reagan_messages.length)] },
            { keyword: 'nick fuentes', response: nick_messages[Math.floor(Math.random() * nick_messages.length)] },
            { keyword: 'ksi', response: ksi_messages[Math.floor(Math.random() * ksi_messages.length)] },
            { keyword: 'mussolini', response: mussolini_messages[Math.floor(Math.random() * mussolini_messages.length)] },
            { keyword: 'tate', response: tate_messages[Math.floor(Math.random() * tate_messages.length)] },
            { keyword: 'admin', response: 'demoted' },
            { keyword: 'https://tenor.com/view/the-simpsons-bart-shock-electric-chair-gif-12706212', response: 'Me after lobotomy' },
            { keyword: 'oh true', response: 'https://tenor.com/view/oh-true-true-fire-writing-true-fire-true-writing-fire-gif-17199454423395239363' },
            { keyword: 'ezgif-7-f82d4a7d07.gif', response: 'Tomoko haters irl\nRats' },
            { keyword: 'alien x', response: { files: [new AttachmentBuilder(path.join(__dirname, '../media/andrewx.jpg'))] } },
            { keyword: 'https://tenor.com/view/woo-yeah-bunny-no-text-woo-yeah-bunny-woo-yeah-gif-13133555004167092953', response: 'Literally me\nIn school years ago\nThen i become edgy\nThen a discord owner\nThen a ex discord owner\nThen SpookedDoor become my right hand\nThen Trump won\nHappy history' },
            { keyword: 'banana-drew', response: "Pog my own animatronic nickname\nA monkey animatronic from alabama" },
            { keyword: 'evil', response: "I am evil" },
            { keyword: 'wtf', response: { files: [new AttachmentBuilder(path.join(__dirname, '../media/WTF.png'))] } },
        ];

        const lowerCaseMessage = message.content.toLowerCase();
        const matchedKeywords = responses.filter(({ keyword }) => lowerCaseMessage.includes(keyword));
        matchedKeywords.sort((a, b) => lowerCaseMessage.indexOf(a.keyword) - lowerCaseMessage.indexOf(b.keyword));

        try {
            if (!status.getSleepStatus(message.guild.id)) {
                for (const { response, response2 } of matchedKeywords) {
                    message.channel.send(response);
                    if (response2) message.channel.send(response2);
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

                    const attachments = aiAttachment(reply);
                    if (reply) {
                        if (attachments) {
                            await message.reply({ content: reply, files: attachments });
                        } else {
                            await message.reply(reply);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while sending the message.');
        }
    },
};