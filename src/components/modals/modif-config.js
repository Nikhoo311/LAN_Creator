const { readFileSync, writeFile } = require("fs");
const { MessageFlags } = require('discord.js');

module.exports = {
    data: {
        name: "modif-config"
    },
    async execute(interaction, client) {
        const configName = interaction.fields.getTextInputValue("config_name");
        const configAdress = interaction.fields.getTextInputValue('config_adress');
        const configHours = interaction.fields.getTextInputValue("config_hours");
        const configMaterials = interaction.fields.getTextInputValue("config_material") || "Aucun";
        
        const file = JSON.parse(readFileSync("./config/bd.json", "utf-8"));
        
        let placeholder = client.placeholder.get(interaction.applicationId);
        
        file[`bd`] = file[`bd`].filter(item => item.name !== placeholder)
        file[`bd`].push({
            name: configName, adress: configAdress, hours: configHours, materials: configMaterials
        })
        
        // Write in the data base
        try {
            writeFile('./config/bd.json', JSON.stringify(file, null, 4), err => {
                if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'bd.json'")
            })
            interaction.update({ content: `✅ La configuration \`${placeholder}\` à bien été modifier avec succès !`, embeds: [], components: [], flags: [MessageFlags.Ephemeral]})
            
        } catch (error) {
            interaction.reply({ content: "❌ Un erreur est survenu lors de l'écriture dans le fichier de configuration !", flags: [MessageFlags.Ephemeral] })
        }
        client.placeholder.delete(interaction.applicationId)
    }
}   