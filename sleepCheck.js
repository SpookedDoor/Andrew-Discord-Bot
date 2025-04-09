const { MessageFlags } = require('discord.js');
const status = require('./setSleep.js');

module.exports = async (interaction, next) => {
    try {
        if (!interaction.guild) return next();
        const serverId = interaction.guild.id;
        if (status.getSleepStatus(serverId) && (interaction.commandName !== 'wake' && interaction.commandName !== 'status')) {
            return interaction.reply({
                content: 'Shhhh... lil Androo is sleeping. Ask an admin to wake him up.',
                flags: MessageFlags.Ephemeral
            });
        }
        next(); 
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while executing this command.', flags: MessageFlags.Ephemeral });
    }
};
