const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({ 
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: process.env.OPENROUTER_API_KEY 
});

module.exports = openai;
