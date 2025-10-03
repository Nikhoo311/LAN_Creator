const { readFileSync, writeFile } = require("fs");
const { MessageFlags } = require('discord.js');
const Config = require('../../../schemas/config');

module.exports = {
    data: {
        name: "creation-config"
    },
    async execute(interaction, client) {
        const configName = interaction.fields.getTextInputValue("config_name");
        const configAdress = interaction.fields.getTextInputValue('config_adress');
        const configHours = interaction.fields.getTextInputValue("config_hours");
        const configMaterials = interaction.fields.getTextInputValue("config_material") || null;
        
        try {
            const alreadyExist = await Config.findOne({ name: configName });

            if (alreadyExist) {
                return interaction.reply({ 
                    content: `❌ Une configuration au nom de \`${configName}\` existe déjà...`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
            await Config.create({
                name: configName,
                adress: configAdress,
                hours: configHours,
                materials: configMaterials ?? "Aucun",      
            });

            interaction.reply({ 
                content: `✅ La configuration \`${configName}\` a bien été créée avec succès !`, 
                flags: [MessageFlags.Ephemeral]
            });
            
        } catch (error) {
            console.error(error);
            interaction.reply({ 
                content: "❌ Une erreur est survenue lors de l'écriture dans la configuration !", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    }
}