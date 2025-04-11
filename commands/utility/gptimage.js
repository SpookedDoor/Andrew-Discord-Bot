// Load environment variables from the .env file
require('dotenv').config();

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

// Use the Hugging Face API key from the .env file
const API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_URL = 'https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning';

// Function to send the image to Hugging Face for captioning
async function getImageCaption(imageUrl) {
  try {
    const response = await axios.post(
      MODEL_URL,
      {
        inputs: imageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // Extract the caption from the response
    return response.data[0]?.generated_text || 'Sorry, I couldn\'t generate a caption.';
  } catch (error) {
    console.error('Error fetching caption:', error);
    return 'Error processing image.';
  }
}

// Slash command definition
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gptimage')
    .setDescription('Make lil Androo describe an image!')
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Image to caption')
        .setRequired(true)),
  
  async execute(interaction) {
    const imageAttachment = interaction.options.getAttachment('image');
    
    // Send the image URL to Hugging Face for captioning
    const caption = await getImageCaption(imageAttachment.url);

    // Respond with the generated caption
    await interaction.reply({
	          content: `Here's the caption for the image: \n${caption}`,
	          files: [imageAttachment.url],
    });
  },
};
