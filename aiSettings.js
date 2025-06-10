require('dotenv').config();

// Change to a different URL if not using KoboldCPP, examples are shown below
// https://openrouter.ai/api/v1
// https://llm.chutes.ai/v1
const baseURL = "http://localhost:5001/v1";

// If using an online AI service, change this to your API key stored in ".env"
// Example: process.env.CHUTES_API_KEY
const apiKey = "0";

const gptModel = "koboldcpp"; // for gpt.js
const gptimageModel = "koboldcpp"; // for gptimage.js

// for messageCreate.js
const messageModel = "koboldcpp";
const messageImageModel = "koboldcpp";

module.exports = { baseURL, apiKey, gptModel, gptimageModel, messageModel, messageImageModel };