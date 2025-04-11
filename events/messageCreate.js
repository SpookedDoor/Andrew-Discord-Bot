const { Events } = require('discord.js');
const status = require('../setSleep.js');
const openaiCommand = require('../commands/utility/gpt.js');
const { braveSearch } = require('../braveSearch.js');
const { braveImageSearch } = require('../braveImageSearch.js');
const { emojis, griffith_messages, kanye_messages, reagan_messages, nick_messages, ksi_messages } = require('../messageDatabase.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
	{ user: 'hellbeyv2', display: 'hellbey' },
	{ user: 'sillyh.', display: 'trinke' },
	{ user: 'nonamebadass', display: 'poncho' }
];

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		console.log(`Message from ${message.author.tag} in ${message.guild.name} - ${message.channel.name}: ${message.content || '[No text]'}`);
		if (message.attachments.size > 0) {
			console.log(`Attachments: ${message.attachments.map(a => a.url).join(', ')}`);
		}

		const god = gods.find(g => 
        	message.author.username.toLowerCase().includes(g.user.toLowerCase()) || 
        	(message.member && message.member.displayName.toLowerCase().includes(g.display.toLowerCase()))
    	);
		let title = god ? 'god' : 'friend';

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
			{ keyword: 'admin', response: 'demoted' },
    	];

    	const lowerCaseMessage = message.content.toLowerCase();

        const matchedKeywords = responses.filter(({ keyword }) =>
            lowerCaseMessage.includes(keyword.toLowerCase())
        );

        matchedKeywords.sort((a, b) =>
            lowerCaseMessage.indexOf(a.keyword.toLowerCase()) - lowerCaseMessage.indexOf(b.keyword.toLowerCase())
        );

		const askIfToolIsNeeded = async (userPrompt, model) => {
			const toolPrompt = `
				A user asked: "${userPrompt}"
				
				Decide what tool (if any) is needed to answer.
				
				- If you need to search the web for context, reply with: WEB_SEARCH: <query>
				- If you need to find image results, reply with: IMAGE_SEARCH: <query>
				- If you can answer without using the internet, reply with: NO_SEARCH
				
				Only respond with one of the above formats. Do not include any extra text.
				`;
		
			const decision = await openaiCommand.generateChatCompletion('system', toolPrompt, model);
			return decision.trim();
		};	
	
		try {
			if (!status.getSleepStatus(message.guild.id)) {
				// Classic keyword replies
				for (const { response, response2 } of matchedKeywords) {
					message.channel.send(response);
					if (response2) message.channel.send(response2);
				}

				// === AI RESPONSE TRIGGERS ===
				const botWasMentioned = message.mentions.has(message.client.user);
				const triggerWords = ['andrew', 'androo'];
				const triggeredByKeyword = triggerWords.some(word => lowerCaseMessage.includes(word));
				const isReplyToBot = message.reference && (await message.fetchReference()).author?.id === message.client.user.id;

				if (botWasMentioned || triggeredByKeyword || isReplyToBot) {
					try {
						await message.channel.sendTyping();

						let prompt = message.content.replace(/<@!?(\d+)>/, '').trim();

						const model = 'openrouter/optimus-alpha';
						console.log(`Model used: ${model}, Location: ${message.guild.name} - ${message.channel.name}, Prompt: ${prompt}`);

						const toolDecision = await askIfToolIsNeeded(prompt, model);
						let finalPrompt = prompt;

						if (toolDecision.startsWith("WEB_SEARCH:")) {
							const query = toolDecision.replace("WEB_SEARCH:", "").trim();
							const searchResults = await braveSearch(query);
							finalPrompt = `User asked: "${prompt}"\n\nRelevant web results:\n${searchResults}`;
							console.log(`🔍 Web search used with query: "${query}"\n${searchResults}`);
						} else if (toolDecision.startsWith("IMAGE_SEARCH:")) {
							const query = toolDecision.replace("IMAGE_SEARCH:", "").trim();
							const imageResults = await braveImageSearch(query);
							finalPrompt = `User asked: "${prompt}"\n\nRelevant image links:\n${imageResults}`;
							console.log(`🖼️ Image search used with query: "${query}"\n${imageResults}`);
						} else {
							console.log(`No internet tools used.`);
						}

						if (isReplyToBot) {
                            const refMessage = await message.fetchReference();
                            previousMessage = refMessage.content;  // Previous response from bot
                            finalPrompt = `${previousMessage}\n${prompt}`;
                            console.log(`Replying to previous message. Combined prompt: ${finalPrompt}`);
                        }

						const reply = await openaiCommand.generateChatCompletion(message.author.id, finalPrompt, model);
						console.log(`AI response: ${reply}`);
						if (reply) message.reply(reply);
					} catch (err) {
						console.error('Error generating AI response:', err);
						message.reply("Can't think now...");
					}
				}
			}
		} catch (error) {
			console.log(error);
			message.reply('An error occurred while sending the message.');
		}
	},
};
