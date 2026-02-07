const { SlashCommandBuilder } = require('discord.js');
const { Client } = require("@gradio/client");
const fs = require("fs");
const path = require("path");

const GRADIO_URL = "http://127.0.0.1:8000/";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Make lil Androo actually speak!')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('Text prompt')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const prompt = interaction.options.getString('prompt');

        console.log(`Speech input: ${prompt}`);
        console.log(`Location: ${interaction.guild ? `${interaction.guild.name} - ${interaction.channel.name}` : `${interaction.user.username} - DM`}`);
        console.log(`User: ${interaction.user.username}`);

        try {
            try {
                const healthCheck = await fetch(GRADIO_URL, { method: "GET", signal: AbortSignal.timeout(2000) });
                if (!healthCheck.ok) throw new Error("Server responded but not healthy");
            } catch {
                return interaction.editReply("TTS server is offline");
            }

            const file = fs.readFileSync(path.resolve(__dirname, "../../media/downsyndrome.mp3"));
            const refBlob = new Blob([file], { type: "audio/mpeg" });

            const client = await Client.connect(GRADIO_URL);
            const result = await client.predict("/run_voice_clone", { 
                ref_aud: refBlob,
                ref_txt: "",
                use_xvec: true,   
                text: prompt,
                lang_disp: "Auto",
            });

            const audioOut = result.data[0].url;
            if (!audioOut) return interaction.editReply("Model returned no audio output");

            const response = await fetch(audioOut);
            if (!response.ok) throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
            const buffer = Buffer.from(await response.arrayBuffer());

            await interaction.editReply({ files: [{ attachment: buffer, name: "audio.wav" }] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to generate audio');
        }
    }
};