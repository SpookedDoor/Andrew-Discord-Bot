const { MessageFlags } = require('discord.js');
const status = require('./setSleep.js');

module.exports = async (interaction, next) => {
    if (status.isAsleep && (interaction.commandName !== 'wake' && interaction.commandName !== 'status')) {
        return interaction.reply({
            content: 'Shhhh... lil Androo is sleeping. Ask Dragonary or SpookedDoor to wake him up.',
            flags: MessageFlags.Ephemeral
        });
    }
    next(); 
};
