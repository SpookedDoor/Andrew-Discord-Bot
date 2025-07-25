require('dotenv').config();

// Change to a different URL if not using Gemini, examples are shown below
// https://api.mistral.ai/v1
// https://openrouter.ai/api/v1
// http://localhost:5001/v1
const baseURL = "https://generativelanguage.googleapis.com/v1beta/";

// If using a different online AI service, change this to your API key stored in ".env"
// Examples: process.env.GEMINI_API_KEY, process.env.MISTRAL_API_KEY
// If using local AI, change this to "0", although it doesn't really matter and you can leave it as-is
const apiKey = process.env.GEMINI_API_KEY;

// If using koboldcpp, change ALL of these to "koboldcpp"
// For vision to work locally, download the correct mmproj from https://huggingface.co/koboldcpp/mmproj/tree/main
// Example: If you are using a model based on Llama3, download the one that says Llama3, then you would insert it into Loaded Files > Vision mmproj
const gptModel = "gemini-2.5-flash";
const gptimageModel = "gemini-2.5-flash";

module.exports = { baseURL, apiKey, gptModel, gptimageModel };