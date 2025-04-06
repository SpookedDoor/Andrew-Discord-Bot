const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const channelId = '1069661626669727769';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('ready', () => {
	console.log(`${client.user.tag} has connected to Discord!`);

	const sendRandomMessage = async () => {
        const channel = client.channels.cache.get(channelId);

        if (!channel) {
            console.log('Channel not found. Please check the CHANNEL_ID.');
            return;
        }

        try {
            await channel.send('<:tomoko_cup:1358095740299116614>');
            console.log('Random message sent.');
        } catch (error) {
            console.error('Error sending random message:', error);
        }

        scheduleRandomMessage();
    };

    const scheduleRandomMessage = () => {
        const randomDelay = Math.floor(Math.random() * (3600000 - 60000 + 1)) + 60000;

        console.log(`Next message will be sent in ${Math.round(randomDelay / 1000)} seconds.`);
        setTimeout(sendRandomMessage, randomDelay);
    };

    scheduleRandomMessage();
});

const gods_apparently = [
	{ user: 'thedragonary', display: 'dragonary' },
	{ user: 'spookeddoor', display: 'spookeddoor' },
	{ user: 'hellbeyv2', display: 'hellbey' },
	{ user: 'sillyh.', display: 'trinke' },
	{ user: 'nonamebadass', display: 'poncho' }
]
  
client.on('messageCreate', (message) => {
	if (message.author.bot) return;
	console.log(`Message from ${message.author.tag}: ${message.content}`);
	
	const god = gods_apparently.find(g => 
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
		{ keyword: 'vultures', response: 'I got no rapper friends i hang whit the vultures'},
    ];

    const words = message.content.replace(/[^\w\s]/g, '').split(/\s+/);

    for (const word of words) {
        for (const { keyword, response } of responses) {
            if (word.toLowerCase() === keyword.toLowerCase()) {
                message.channel.send(response);
            }
        }
    }
});

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', async (input) => {
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
        console.log('Channel not found. Please check the CHANNEL_ID.');
        return;
    }

    try {
        await channel.send(input);
        console.log(`Message sent: ${input}`);
    } catch (error) {
        console.error('Error sending message:', error);
    }
});

client.login(token);