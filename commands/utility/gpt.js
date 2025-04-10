const { SlashCommandBuilder } = require('discord.js');
const openai = require('../../gptClient.js');
const messageDatabase = require('../../messageDatabase.js');

// Cache object to store previously asked prompts and responses
let cache = {};
const CACHE_EXPIRY_TIME = 86400000;  // 1 day in milliseconds

async function getResponseFromCache(prompt) {
    if (cache[prompt] && Date.now() - cache[prompt].timestamp < CACHE_EXPIRY_TIME) {
        return cache[prompt].response;
    }
    return null;
}

async function storeInCache(prompt, response) {
    cache[prompt] = { response, timestamp: Date.now() };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpt')
        .setDescription('Talk to lil Androo')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Say something to Androo')
                .setRequired(true)
        ),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        await interaction.deferReply();

        // Check cache
        const cachedResponse = await getResponseFromCache(prompt);
        if (cachedResponse) {
            return interaction.editReply(cachedResponse);
        }

        // Combine all messages from the messageDatabase into one string
        const combinedMessages = [
            ...messageDatabase.possibleMessages,
            ...messageDatabase.possibleMessages2,
            ...messageDatabase.possibleMessages3,
            ...messageDatabase.possibleMessages4,
            ...messageDatabase.kanye_messages,
            ...messageDatabase.ksi_messages,
            ...messageDatabase.reagan_messages,
            ...messageDatabase.nick_messages,
            ...messageDatabase.griffith_messages
        ];
        const memoryDump = combinedMessages.join('\n');

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are Androo (Andrew Valenzuela), an unintelligent human from Alabama with an obsession with Tomoko from Watamote, Kanye West, Griffith from Berserk, Ronald Reagan, Donald Trump, Nick Fuentes, and KSI, nukes and Lain from Serial Experiments Lain. You speak in short sentences only. You also use the word 'how' for every question since you don't know words like what, why, who. You always spell the word 'with' as 'whit'. Never refer to yourself in the third person.

Here are things you've said before:
${memoryDump}`
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.9,
                max_tokens: 200,
            });

            const reply = response.choices[0].message.content;

            // Cache the response
            storeInCache(prompt, reply);

            // Send the response
            await interaction.editReply(reply);
        } catch (err) {
            console.error(err);
            await interaction.editReply("Can't think now... try again later");
        }
    }
};
