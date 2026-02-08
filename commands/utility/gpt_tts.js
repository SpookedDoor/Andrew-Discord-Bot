const { SlashCommandBuilder } = require('discord.js');
const { Client } = require("@gradio/client");
const fs = require("fs");
const path = require("path");
const db = require("../../db");
const { gptModel } = require('../../aiSettings.js');
const { generateChatCompletion } = require("./gpt");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpt_tts')
        .setDescription('Androo will respond using his voice!')
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
            const { rows } = await db.query('SELECT url FROM tts_server WHERE id = 1');
            const url = rows[0].url;

            try {
                const healthCheck = await fetch(url, { method: "GET", signal: AbortSignal.timeout(2000) });
                if (!healthCheck.ok) throw new Error("Server responded but not healthy");
            } catch {
                return interaction.editReply("TTS server is offline");
            }

            const reply = await generateChatCompletion(
                interaction.guild?.id,
                interaction.user.id,
                prompt,
                prompt,
                gptModel,
                interaction.user.username,
                interaction.client
            );

            const file = fs.readFileSync(path.resolve(__dirname, "../../media/downsyndrome.mp3"));
            const refBlob = new Blob([file], { type: "audio/mpeg" });

            const client = await Client.connect(url);
            const result = await client.predict("/run_voice_clone", { 
                ref_aud: refBlob,
                ref_txt: "",
                use_xvec: true,   
                text: reply,
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
