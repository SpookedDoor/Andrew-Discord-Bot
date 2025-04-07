const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

const rest = new REST().setToken(token);

// for global commands. If it ain't obvious, the numbers inserted here is the commandId. Replace that with whatever command you wanna delete :iminnocent:
rest.delete(Routes.applicationCommand(clientId, '1358099624509833297'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);