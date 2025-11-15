const { MessageFlags } = require('discord.js');
const Config = require("../../../schemas/config");
const { encrypt } = require('../../../functions/utils/crypt');

module.exports = {
    data: {
        name: "modif-config"
    },
    async execute(interaction, client) {
        const configName = interaction.fields.getTextInputValue("config_name");
        const configaddress = interaction.fields.getTextInputValue("config_address");
        const configHours = interaction.fields.getTextInputValue("config_hours");
        const configMaterials = interaction.fields.getTextInputValue("config_material") || "Aucun";
        
        const placeholder = client.placeholder.get(interaction.applicationId);

        try {
            const updatedConfig = await Config.findOneAndUpdate(
                { name: placeholder },
                {
                    name: configName,
                    address: encrypt(configaddress, process.env.TOKEN),
                    hours: configHours,
                    materials: configMaterials,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updatedConfig) {
                return interaction.update({ 
                    content: `❌ Impossible de trouver une configuration nommée \`${placeholder}\`.`, 
                    embeds: [], 
                    components: [], 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
            client.configs.delete(placeholder);
            client.configs.set(updatedConfig.name, updatedConfig);

            interaction.update({ content: `✅ La configuration \`${placeholder}\` a bien été modifiée en \`${configName}\` avec succès !`, embeds: [], components: [], flags: [MessageFlags.Ephemeral] });

        } catch (error) {
            console.error(error);
            interaction.reply({ 
                content: "❌ Une erreur est survenue lors de la mise à jour de la configuration !", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
        client.placeholder.delete(interaction.applicationId);
    }
}