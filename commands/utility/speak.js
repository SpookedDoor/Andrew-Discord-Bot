const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const VOICE_MAP = {
    Adam: 'pNInz6obpgDQGcFmaJgB',
    Antoni: 'ErXwobaYiN019PkySvjV',
    Finn: 'vBKc2FfBKJfcZNyEt1n6',
    Hope: 'tnSpp4vdxKPjI9w0GnoV'
};

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
                    { name: 'Adam', value: 'Adam' },
                    { name: 'Antoni', value: 'Antoni' },
                    { name: 'Finn', value: 'Finn' },
                    { name: 'Hope', value: 'Hope' }
                )),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const voice = interaction.options.getString('voice') || 'Adam';
        const voiceId = VOICE_MAP[voice] || VOICE_MAP['Adam'];
        const apiKey = process.env.ELEVENLABS_API_KEY;

        await interaction.deferReply();

        console.log(`Speech input: ${prompt}`);
        console.log(`Voice: ${voice} (ID: ${voiceId})`);
        console.log(`Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
        console.log(`User: ${interaction.user.username}`);

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({
                    text: prompt,
                    model_id: 'eleven_flash_v2_5',
                    voice_settings: {
                        speed: 0.9,
                        stability: 1.0,
                        similarity_boost: 1.0
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.statusText}`);
            }

            const audioBuffer = Buffer.from(await response.arrayBuffer());
            await interaction.editReply({
                files: [{ attachment: audioBuffer, name: 'audio.mp3' }]
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to generate audio.');
        }
    }
};