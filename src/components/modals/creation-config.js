const { readFileSync, writeFile } = require("fs");
const { MessageFlags } = require('discord.js');

module.exports = {
    data: {
        name: "creation-config"
    },
    async execute(interaction, client) {
        const configName = interaction.fields.getTextInputValue("config_name");
        const configAdress = interaction.fields.getTextInputValue('config_adress');
        const configHours = interaction.fields.getTextInputValue("config_hours");
        const configMaterials = interaction.fields.getTextInputValue("config_material") || "Aucun";
        
        const file = JSON.parse(readFileSync("./config/bd.json", "utf-8"));
        
        function getInfoConfig(name) {
            let result;
            file["bd"].forEach(element => {
                if (element.name == name) {
                    result = element
                }
            });
            return result;
        }

        if (getInfoConfig(configName)) {
            return interaction.reply({ content: `❌ Une configuration au nom de \`${configName}\` existe déjà...`, flags: [MessageFlags.Ephemeral] })
        }

        file[`bd`].push({
            name: configName, adress: configAdress, hours: configHours, materials: configMaterials
        })
        // Write in the data base
        try {
            writeFile('./config/bd.json', JSON.stringify(file, null, 4), err => {
                if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'bd.json'")
            })
            interaction.reply({ content: `✅ La configuration \`${configName}\` à bien été créer avec succès !`, flags: [MessageFlags.Ephemeral]})
            
        } catch (error) {
            interaction.reply({ content: "❌ Un erreur est survenu lors de l'écriture dans le fichier de configuration !", flags: [MessageFlags.Ephemeral] })
        }

    }
}