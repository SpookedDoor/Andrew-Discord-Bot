const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const path = require('node:path');
const loadCommands = require('./loadCommands');

const commandsPath = path.join(__dirname, 'commands');
const commands = loadCommands(commandsPath).map(command => command.data.toJSON());

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();