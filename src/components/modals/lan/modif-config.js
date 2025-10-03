const { MessageFlags } = require('discord.js');
const Config = require("../../../schemas/config");

module.exports = {
    data: {
        name: "modif-config"
    },
    async execute(interaction, client) {
        const configName = interaction.fields.getTextInputValue("config_name");
        const configAdress = interaction.fields.getTextInputValue("config_adress");
        const configHours = interaction.fields.getTextInputValue("config_hours");
        const configMaterials = interaction.fields.getTextInputValue("config_material") || "Aucun";
        
        const placeholder = client.placeholder.get(interaction.applicationId);

        try {
            const updatedConfig = await Config.findOneAndUpdate(
                { name: placeholder },
                {
                    name: configName,
                    adress: configAdress,
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