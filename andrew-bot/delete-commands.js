const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST().setToken(token);

// ...

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(clientId, guildId, '1358099624509833297'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands. If it ain't obvious, the numbers inserted here is the commandId. Replace that with whatever command you wanna delete :iminnocent: Same with the gulid-based one.
rest.delete(Routes.applicationCommand(clientId, '1358099624509833297'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);