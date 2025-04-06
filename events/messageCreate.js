const { Events } = require('discord.js');

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
		console.log(`Message from ${message.author.tag}: ${message.content}`);
	
		const god = gods.find(g => 
        	message.author.username.toLowerCase().includes(g.user.toLowerCase()) || 
        	message.member?.displayName.toLowerCase().includes(g.display.toLowerCase())
    	);
		let title = god ? 'god' : 'friend';

    	const responses = [
        	{ keyword: 'hello', response: `hello ${god ? god.display : message.author.displayName} ${title}` },
        	{ keyword: 'bye', response: 'GN all i am Griffith' },
        	{ keyword: 'cheese', response: 'This aint cheddar this quiche' },
			{ keyword: 'venezuela', response: 'I am from alabama' },
			{ keyword: 'fish27.reset()', response: '<:tomoko_cup:1358095740299116614>' },
			{ keyword: 'kanye', response: 'https://tenor.com/view/kanye-west-vultures-everybody-new-gif-12847039774498163445' },
			{ keyword: 'vultures', response: 'I got no rapper friends i hang whit the vultures' },
			{ keyword: 'reagan', response: 'https://tenor.com/view/republican-gif-24490147' },
    	];	

    	const words = message.content.replace(/[^\w\s]/g, '').split(/\s+/);

    	for (const word of words) {
        	for (const { keyword, response } of responses) {
            	if (word.toLowerCase() === keyword.toLowerCase()) {
                	message.channel.send(response);
	            }
    	    }
    	}
	},
};