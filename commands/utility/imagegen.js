const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagegen')
        .setDescription('Make lil Androo generate an image!')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Text prompt')
                .setRequired(true)),

    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');

        await interaction.deferReply();

        console.log(`Generating image with prompt: ${prompt}`);
        console.log(`Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
        console.log(`User: ${interaction.user.username}`);

        try {
            const response = await fetch('https://chutes-hidream.chutes.ai/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CHUTES_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    seed: null,
                    prompt: prompt,
                    resolution: "1024x1024",
                    guidance_scale: 5,
                    num_inference_steps: 50
                })
            });

            if (!response.ok) {
                throw new Error(`Chutes API error: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            await interaction.editReply({
                files: [{ attachment: Buffer.from(buffer), name: 'image.jpg' }]
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to generate image.');
        }
    }
};