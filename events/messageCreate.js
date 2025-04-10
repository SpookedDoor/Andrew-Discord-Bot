const { Events } = require('discord.js');
const status = require('../setSleep.js');
const openaiCommand = require('../commands/utility/gpt.js');
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
				const isReplyToBot = message.reference 
					&& (await message.fetchReference()).author?.id === message.client.user.id;

				if (botWasMentioned || triggeredByKeyword || isReplyToBot) {
					try {
						await message.channel.sendTyping();

						const prompt = message.content.replace(/<@!?(\d+)>/, '').trim();
						const model = 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free';
						console.log(`Model used: ${model}, Prompt: ${prompt}`);

						const reply = await openaiCommand.generateResponse(prompt, model);
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
