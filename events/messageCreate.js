const { Events } = require('discord.js');

const gods = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
	{ user: 'hellbeyv2', display: 'hellbey' },
	{ user: 'sillyh.', display: 'trinke' },
	{ user: 'nonamebadass', display: 'poncho' }
];

const kanye_messages = ["Kanye the goat", "I love Kanye", "Kanye will drop new album", "new kanye interview", "Like new Kanye album?", 
	"This aint cheddar this quiche", "I hang whit the vultures", "You like vultures also?", "I like vultures", "Vultures 2 is goated", 
	"I got all to hang whit the vultures", "https://tenor.com/view/kanye-west-vultures-everybody-new-gif-12847039774498163445", 
	"https://tenor.com/view/ye-kanye-kanye-vultures-vultures-listening-party-vultures-lp-gif-14111380029791063141", 
	"https://tenor.com/view/kanye-west-gif-1846075065280866456", "https://tenor.com/view/kanye-west-kanye-ye-um-uhm-gif-1371611536126645899", 
	"https://tenor.com/view/kanye-west-my-reaction-to-that-information-my-honest-reaction-meme-gif-15000744814966995138"]

const reagan_messages = ["Reagan was the best", "Reagan number 1", "Reagan number 1 president ever", "Reagan turn down the wall", "Trump and Reagan goats", 
	"Reagan and Trump best presidents ever", "Ronald pls", "https://tenor.com/view/republican-gif-24490147", 
	"https://tenor.com/view/ronald-reagan-reagan-republican-usa-president-gif-14605911613553531779"]

let timed_message = new Date().getUTCHours() < 6 ? 'GN' : new Date().getUTCHours() < 12 ? 'morning' : new Date().getUTCHours() < 22 ? 'hello' : 'GN';
const griffith_messages = [timed_message + ' all i am Griffith', 'I am prime Griffith', 'https://i.imgflip.com/9q0wk1.jpg'];

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		if (message.author.bot) return;
		console.log(`Message from ${message.author.tag}: ${message.content}`);
	
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
			{ keyword: 'nick fuentes', response: 'nick fuentes is straight' },
			{ keyword: 'ksi', response: 'https://tenor.com/view/from-the-screen-to-the-ring-the-the-pen-to-the-king-ksi-gif-12257927774644906851' },
    	];	

    	const lowerCaseMessage = message.content.toLowerCase();

        const matchedKeywords = responses.filter(({ keyword }) =>
            lowerCaseMessage.includes(keyword.toLowerCase())
        );

        matchedKeywords.sort((a, b) =>
            lowerCaseMessage.indexOf(a.keyword.toLowerCase()) - lowerCaseMessage.indexOf(b.keyword.toLowerCase())
        );

        for (const { response, response2 } of matchedKeywords) {
            message.channel.send(response);
			if (response2) message.channel.send(response2);
        }
	},
};
