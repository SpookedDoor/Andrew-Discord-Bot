const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({ 
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gptimage')
    .setDescription('Make lil Androo describe an image!')
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Image to analyse')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('model')
        .setDescription('Select a multimodal model')
        .setRequired(false)
        .addChoices(
          { name: 'Optimus Alpha', value: 'openrouter/optimus-alpha' },
          { name: 'Deepseek V3', value: 'deepseek/deepseek-chat-v3-0324:free' },
          { name: 'Llama 4 Scout', value: 'meta-llama/llama-4-scout:free' },
          { name: 'Llama 4 Maverick', value: 'meta-llama/llama-4-maverick:free' },
          { name: 'Llama 3.3 Nemotron Super', value: 'nvidia/llama-3.3-nemotron-super-49b-v1:free' },
          { name: 'Llama 3.1 Nemotron Ultra', value: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free' },
          { name: 'Mistral Nemo', value: 'mistralai/mistral-nemo:free' },
          { name: 'Mistral Small 3.1', value: 'mistralai/mistral-small-3.1-24b-instruct:free' },
          { name: 'Google Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-exp:free' },
          { name: 'Google Gemma 3', value: 'google/gemma-3-27b-it:free' },
          { name: 'Rogue Rose', value: 'sophosympatheia/rogue-rose-103b-v0.2:free' },
      )),

  async execute(interaction) {
    const imageAttachment = interaction.options.getAttachment('image');
    const imageUrl = imageAttachment.url;
    const model = interaction.options.getString('model') || 'openrouter/optimus-alpha';

    await interaction.deferReply();

    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: "Describe this image in detail. Mention characters, setting, and what's happening." },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.8,
      });

      const reply = response.choices[0]?.message?.content || "Couldn't describe the image.";

      await interaction.editReply({
        content: `🧠 Description:\n${reply}`,
        files: [imageUrl]
      });

    } catch (err) {
      console.error(err);
      await interaction.editReply("There was a problem analysing the image.");
    }
  }
};