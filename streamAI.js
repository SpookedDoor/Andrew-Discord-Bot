const { baseURL, apiKey, gptModel } = require('./aiSettings');
const { OpenAI } = require('openai');
const openai = new OpenAI({ baseURL, apiKey });
const content = require('./characterPrompt');

/**
 * Streams an OpenAI response and simulates typing via message edits.
 * @param {string} prompt - The user's message to the AI
 * @param {function} editCallback - Called with partial content during streaming
 * @returns {Promise<string>} - The full response
 */

async function streamAIResponse(prompt, editCallback) {
    let fullResponse = '';
    let lastEdit = Date.now();

    const stream = await openai.chat.completions.create({
        model: gptModel,
        messages: [
            { role: 'user', content: `${content}\n${prompt}` }
        ],
        stream: true,
    });

    for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content;
        if (!token) continue;

        fullResponse += token;

        // Call the edit callback periodically
        if (Date.now() - lastEdit > 1) {
            lastEdit = Date.now();
            await editCallback(fullResponse.slice(0, 2000));
        }
    }

    // Final callback
    await editCallback(fullResponse.slice(0, 2000));

    return fullResponse;
}

module.exports = { streamAIResponse };