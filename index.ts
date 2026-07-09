import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import loadCommands from "./loadCommands.ts";
dotenv.config({ quiet: true });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
    ],
});

const __dirname = import.meta.dirname;

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commands = await loadCommands(commandsPath);
for (const command of commands) client.commands.set(command.data.name, command);

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const { default: event } = await import(filePath);
    if (event.once) client.once(event.name, (...args: any) => event.execute(...args));
    else client.on(event.name, (...args: any) => event.execute(...args));
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
    } else if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
