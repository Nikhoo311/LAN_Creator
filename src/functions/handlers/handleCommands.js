const { readdirSync } = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const ms = require('ms');
const logger = require("../utils/Logger");
const { clientID, serverID } = require("../../../config/config.json");

module.exports = (client) => {
    const { commandArray, commands } = client;

    client.handleCommands = async () => {
        const commandsPath = path.join(__dirname, "../..", "commands");
        const commandFolders = readdirSync(commandsPath);

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = readdirSync(folderPath).filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                if (!command.active) { continue; }
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
                logger.command(`[${folder}] ${command.data.name} est chargée avec succès !`);
            }
        }

        const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

        try {
            const start = Date.now();
            logger.slashCommand("Refresh de l'application (/) commandes");

            if (process.env.DEV_MODE === "true") {
                logger.log("Mode développeur actif !")
                await rest.put(
                    Routes.applicationGuildCommands(clientID, serverID),
                    { body: commandArray },
                );
            }
            else {
                logger.warn("Mode production : les commandes peuvent se réinitialiser dans les 1h minimum.")
                await rest.put(
                    Routes.applicationCommands(clientID),
                    { body: commandArray },
                );
            }

            const end = Date.now();
            const duration = end - start;

            logger.slashCommand(`Chargement des (/) commandes terminé !`);
            logger.log(`Chargement des (/) commandes : ${ms(duration)}`)
        } catch (error) {
            console.error(error);
        }
    };
};
