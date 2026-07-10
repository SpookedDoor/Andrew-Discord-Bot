import { REST, Routes, type RESTPutAPIApplicationCommandsResult } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import loadCommands from "./loadCommands.js";
dotenv.config({ quiet: true });

const __dirname = import.meta.dirname;
const commandsPath = path.join(__dirname, "commands");

const rawCommands = await loadCommands(commandsPath);
const commands = rawCommands.map((command) => {
    const json = command.data.toJSON();
    json.integration_types = [0, 1]; // 0 = Guild, 1 = User (DM)
    json.contexts = [0, 1, 2]; // Guild, bot DMs, private chats
    return json;
});

const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = (await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID as string),
            {
                body: commands,
            },
        )) as RESTPutAPIApplicationCommandsResult;

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
