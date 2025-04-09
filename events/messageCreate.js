const { Events } = require('discord.js');
const status = require('../setSleep.js');
const { griffith_messages, kanye_messages, reagan_messages, nick_messages, ksi_messages } = require('../messageDatabase.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
	{ user: 'hellbeyv2', display: 'hellbey' },
	{ user: 'sillyh.', display: 'trinke' },
	{ user: 'nonamebadass', display: 'poncho' }
];

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		if (message.author.bot) return;
		console.log(`Message from ${message.author.tag} in ${message.guild.name} - ${message.channel.name}: ${message.content}`);
	
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
			{ keyword: 'fish27.reset()', response: 'hello friends', response2: '<:tomoko_cup:1358095740299116614>' },
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
	
		if (!status.getSleepStatus(message.guild.id)) {
        	for (const { response, response2 } of matchedKeywords) {
            	message.channel.send(response);
				if (response2) message.channel.send(response2);
        	}
		}
	},
};