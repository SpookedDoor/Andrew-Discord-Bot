const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const path = require('node:path');
const loadCommands = require('./loadCommands');

const commandsPath = path.join(__dirname, 'commands');

const rawCommands = loadCommands(commandsPath).map(command => {
		const json = command.data.toJSON();
		json.integration_types = [0, 1]; // 0 = Guild, 1 = User (DM)
		json.contexts = [0, 1, 2];       // Guild, bot DMs, private chats
		return json;
});

const rest = new REST().setToken(token);

(async () => {
		try {
					console.log(`Started refreshing ${rawCommands.length} application (/) commands.`);

					const data = await rest.put(
									Routes.applicationCommands(clientId),
									{ body: rawCommands },
								);

					console.log(`Successfully reloaded ${data.length} application (/) commands.`);
				} catch (error) {
							console.error(error);
						}
})();
