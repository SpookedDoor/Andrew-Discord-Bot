import fs from "fs";
import path from "path";

export default async function loadCommands(commandsPath: string) {
    const commands = [];
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const { default: command } = await import(filePath);

            if ("data" in command && "execute" in command) {
                commands.push(command);
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
                );
            }
        }
    }

    return commands;
}
