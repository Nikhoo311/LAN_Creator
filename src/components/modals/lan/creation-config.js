const { MessageFlags } = require('discord.js');
const Config = require('../../../schemas/config');
const { encrypt } = require("../../../functions/utils/crypt");

module.exports = {
    data: {
        name: "creation-config"
    },
    async execute(interaction, client) {
        const configName = interaction.fields.getTextInputValue("config_name");
        const configaddress = interaction.fields.getTextInputValue('config_address');
        const configHours = interaction.fields.getTextInputValue("config_hours");
        const configMaterials = interaction.fields.getTextInputValue("config_material") || null;
        
        try {
            const alreadyExist = client.configs.has(configName);

            if (alreadyExist) {
                return interaction.reply({ 
                    content: `❌ Une configuration au nom de \`${configName}\` existe déjà...`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
            const createdConfig = await Config.create({
                name: configName,
                address: encrypt(configaddress, process.env.TOKEN),
                hours: configHours,
                materials: configMaterials ?? "Aucun",
            });

            client.configs.set(createdConfig.name, createdConfig);

            interaction.reply({ 
                content: `✅ La configuration \`${configName}\` a bien été créée avec succès !\n# Informations\n* Pour modifier les salons créer lors de la création d'une LAN, cliquez sur le bouton \`Modifier\`.\n* Les salons ${createdConfig.channels.map(ch => `**${ch.name}**`).join(", ")} ont été créés par défaut.`, 
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