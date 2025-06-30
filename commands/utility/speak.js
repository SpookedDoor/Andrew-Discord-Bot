const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
                    { name: 'Fenrir', value: 'am_fenrir' },
                    { name: 'Adam', value: 'am_adam' },
                    { name: 'Heart', value: 'af_heart' },
                    { name: 'George', value: 'bm_george' },
                )),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const voice = interaction.options.getString('voice') || 'am_fenrir';

        await interaction.deferReply();

        console.log(`Speech input: ${prompt}`);
        console.log(`Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
        console.log(`User: ${interaction.user.username}`);

        try {
            const response = await fetch('https://chutes-kokoro.chutes.ai/speak', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CHUTES_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "text": prompt,
                    "speed": 1,
                    "voice": voice
                })
            });

            if (!response.ok) {
                throw new Error(`Chutes API error: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            await interaction.editReply({
                files: [{ attachment: Buffer.from(buffer), name: 'audio.mp3' }]
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to generate audio.');
        }
    }
};