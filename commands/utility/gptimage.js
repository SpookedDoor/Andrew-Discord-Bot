const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({ 
  	baseURL: 'https://openrouter.ai/api/v1',
  	apiKey: process.env.OPENROUTER_API_KEY,
});
const content = require('../../characterPrompt.js');

module.exports = {
  	data: new SlashCommandBuilder()
    	.setName('gptimage')
    	.setDescription('Make lil Androo describe an image!')
    	.addAttachmentOption(option =>
      		option.setName('image')
        	.setDescription('Image to analyse')
        	.setRequired(true))
	.addStringOption(option =>
		option.setName('prompt')
		.setDescription('Text prompt')
		.setRequired(false))
    	.addStringOption(option =>
      		option.setName('model')
        	.setDescription('Select a multimodal model')
        	.setRequired(false)
        	.addChoices(
          		{ name: 'Optimus Alpha', value: 'openrouter/optimus-alpha' },
          		{ name: 'Llama 4 Scout', value: 'meta-llama/llama-4-scout:free' },
          		{ name: 'Llama 4 Maverick', value: 'meta-llama/llama-4-maverick:free' },
				{ name: 'Mistral Small 3.1', value: 'mistralai/mistral-small-3.1-24b-instruct:free' },
				{ name: 'Google Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-exp:free' },
				{ name: 'Google Gemma 3', value: 'google/gemma-3-27b-it:free' },
			)),

  	async execute(interaction) {
		const imageAttachment = interaction.options.getAttachment('image');
		const imageUrl = imageAttachment.url;
		const prompt = interaction.options.getString('prompt') || "Hey Andrew, describe this image and tell me what you think of this?";
		const model = interaction.options.getString('model') || 'openrouter/optimus-alpha';

		await interaction.deferReply();

		try {
      			const reply = await module.exports.generateImagePrompt(prompt, imageUrl, model);
			console.log(`Model used: ${model}, Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
			console.log(`Prompt: ${prompt}, Image URL: ${imageUrl}\nAI response: ${reply}`);
      		await interaction.editReply({ content: reply, files: [imageUrl] });
		} catch (err) {
			console.error(err);
			await interaction.editReply("There was a problem analysing the image");
    	}
  	}
};

module.exports.generateImagePrompt = async function(promptText, imageUrl, model) {
	try {
		const response = await openai.chat.completions.create({
			model,
			messages: [
				{ role: 'system', content },
				{
					role: 'user',
					content: [
						{ type: 'text', text: promptText },
						{ type: 'image_url', image_url: { url: imageUrl } }
					]
				}
			],
			temperature: 0.9
		});

		const reply = response.choices[0]?.message?.content || "Couldn't describe the image";
		return reply;

	} catch (err) {
		console.error("Image prompt failed:", err);
		throw new Error("Image analysis failed.");
	}
};
