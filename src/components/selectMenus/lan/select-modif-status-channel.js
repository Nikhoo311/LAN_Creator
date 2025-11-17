const { MessageFlags } = require("discord.js");

module.exports = {
    data: {
        name: "select-modif-status-channel-active",
        multi: "select-modif-status-channel-desactive"
    },
    async execute(interaction, client) {
        const channelsNames = interaction.values
        
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

            interaction.update({ content: `✅ La configuration \`${placeholder}\` a bien été modifiée en \`${configName}\` avec succès !`, embeds: [configUpdateEmbed, configChannelsUpdateEmbed], components: [], flags: [MessageFlags.Ephemeral] });

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