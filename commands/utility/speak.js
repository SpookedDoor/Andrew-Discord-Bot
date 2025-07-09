const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const wav = require('wav');
const { PassThrough } = require('stream');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('speak')
        .setDescription('Make lil Androo actually speak!')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Text prompt')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('voice')
                .setDescription('Voice')
                .setRequired(false)
                .addChoices(
                    { name: 'Fenrir', value: 'Fenrir' },
                    { name: 'Zephyr', value: 'Zephyr' },
                )),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const voice = interaction.options.getString('voice') || 'Fenrir';

        await interaction.deferReply();

        console.log(`Speech input: ${prompt}`);
        console.log(`Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
        console.log(`User: ${interaction.user.username}`);

        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent', {
                method: 'POST',
                headers: {
                    'x-goog-api-key': process.env.GEMINI_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: voice
                                }
                            }
                        }
                    },
                    model: "gemini-2.5-flash-preview-tts"
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }

            const data = await response.json();
            const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) {
                throw new Error('No audio data returned from Gemini API.');
            }
            const audioBuffer = Buffer.from(base64Audio, 'base64');

            // Convert PCM to WAV in memory
            const wavStream = new PassThrough();
            const writer = new wav.Writer({
                channels: 1,
                sampleRate: 24000,
                bitDepth: 16
            });
            writer.end(audioBuffer);
            writer.pipe(wavStream);

            // Collect WAV buffer
            const wavChunks = [];
            wavStream.on('data', chunk => wavChunks.push(chunk));
            wavStream.on('end', async () => {
                const wavBuffer = Buffer.concat(wavChunks);
                await interaction.editReply({
                    files: [{ attachment: wavBuffer, name: 'audio.wav' }]
                });
            });
            wavStream.on('error', async (err) => {
                console.error(err);
                await interaction.editReply('Failed to generate WAV audio.');
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to generate audio.');
        }
    }
};