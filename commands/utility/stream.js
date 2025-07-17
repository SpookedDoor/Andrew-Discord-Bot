const { SlashCommandBuilder } = require('discord.js');
const { streamAIResponse } = require('../../streamAI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stream')
    .setDescription('Talk to Androo with streaming')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Text prompt')
        .setRequired(true)
    ),

  async execute(interaction) {
    const prompt = interaction.options.getString('prompt');

    await interaction.deferReply();

    try {
      await streamAIResponse(prompt, async (partial) => {
        await interaction.editReply(partial);
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Something went wrong.');
    }
  }
};
