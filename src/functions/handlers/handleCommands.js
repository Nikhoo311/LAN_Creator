const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const logger = require("../utils/Logger");
const { clientID, serverID } = require("../../../config/config.json");

module.exports = (client) => {
    const { commandArray, commands } = client;

    client.handleCommands = async () => {
        const commandsPath = path.join(__dirname, "../..", "commands");
        const commandFolders = fs.readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);

                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());

                logger.command(`[${folder}] ${command.data.name} est chargée avec succès !`);
            }
        }

        const rest = new REST({ version: "9" }).setToken(process.env.token);

        try {
            logger.slashCommand("💡 : Refresh de l'application (/) commandes");
            await rest.put(
                Routes.applicationGuildCommands(clientID, serverID),
                { body: commandArray },
            );
            logger.slashCommand("✅ : Chargement des (/) commandes terminé !");
        } catch (error) {
            console.error(error);
        }
    };
};
