const { MessageFlags } = require("discord.js");
const Config = require("../../../schemas/config");
const { encrypt } = require("../../../functions/utils/crypt");

module.exports = {
    data: {
        name: "save-update-config"
    },
    async execute (interaction, client) {
        const placeholder = client.placeholder.get(interaction.applicationId);
        const currentConfig = client.configs.get(placeholder);
        try {
            const updatedConfig = await Config.findOneAndUpdate(
                { name: placeholder },
                {
                    name: currentConfig.name,
                    address: encrypt(currentConfig.address, process.env.TOKEN),
                    hours: currentConfig.hours,
                    materials: currentConfig.materials,
                    channels: currentConfig.channels,
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
            client.configs.set(updatedConfig.name, updatedConfig);

            interaction.update({ content: `✅ La configuration \`${currentConfig.name}\` a bien été modifiée !`, embeds: [], components: [], flags: [MessageFlags.Ephemeral] });

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

