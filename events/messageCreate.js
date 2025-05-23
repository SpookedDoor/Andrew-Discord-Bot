const { Events } = require('discord.js');
const status = require('../setSleep.js');
const { generateChatCompletion } = require('../commands/utility/gpt.js');
const { generateImagePrompt } = require('../commands/utility/gptimage.js');
const { askIfToolIsNeeded } = require('../searchTools.js');
const { braveSearch } = require('../braveSearch.js');
const { braveImageSearch } = require('../braveImageSearch.js');
const { googleImageSearch } = require('../googleImageSearch.js');
const { findUserIdentity } = require('../userIdentities.js');
const { emojis, griffith_messages, kanye_messages, reagan_messages, nick_messages, ksi_messages, mussolini_messages } = require('../messageDatabase.js');

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
            { keyword: 'admin', response: 'demoted' },
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

                    if (message.attachments.size > 0) {
                        imageUrl = message.attachments.first().url;
                    } else if (message.reference) {
                        try {
                            const repliedMessage = await message.fetchReference();
                            if (repliedMessage.attachments.size > 0) {
                                imageUrl = repliedMessage.attachments.first().url;
                            }
                            if (repliedMessage.content) {
                                finalPrompt = `${repliedMessage.content}\n${prompt}`;
                                console.log(`Replying with context from previous message. Combined prompt: ${finalPrompt}`);
                            }
                        } catch (err) {
                            console.error("Failed to fetch referenced message:", err);
                        }
                    }

                    const model = 'koboldcpp';
                    console.log(`Model used: ${model}, Location: ${message.guild.name} - ${message.channel.name}, Prompt: ${prompt}`);

                    const toolDecision = await askIfToolIsNeeded(finalPrompt, model, imageUrl, generateImagePrompt);

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

                    if (imageUrl) {
                        try {
                            const reply = await generateImagePrompt(finalPrompt, imageUrl, model);
			    			console.log(`Model used: ${model}, Prompt: ${prompt}, Image URL: ${imageUrl}\nAI response: ${reply}`);
                            return message.reply(reply);
                        } catch (err) {
                            console.error("Image analysis failed:", err);
                            return message.reply("There was an issue analysing the image. Please try again later.");
                        }
                    }

					const userInfo = await findUserIdentity({ id: message.author.id, name: message.author.displayname, guild: message.guild });
					const usernameForAI = userInfo?.displayName || message.author.username;

					const reply = await generateChatCompletion(
						message.author.id,
						finalPrompt,
						model,
						usernameForAI,
						message.guild
					);

					console.log(`Prompt: ${finalPrompt}\nAI response: ${reply}`);
                    if (reply) message.reply(reply);
                }
            }
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while sending the message.');
        }
    },
};