const { MessageFlags } = require("discord.js");
const Config = require("../../../schemas/config");
const { encrypt } = require("../../../functions/utils/crypt");
const { getGuildConfig, setConfigCache } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "save-update-config"
    },
    async execute (interaction, client) {
        const placeholder = client.placeholder.get(interaction.applicationId);
        const currentConfig = getGuildConfig(client, placeholder, interaction.guildId);
        
        if (!currentConfig) {
            client.placeholder.delete(interaction.applicationId);
            return await interaction.update({ content: "❌ Configuration introuvable sur ce serveur.", embeds: [], components: [], flags: [MessageFlags.Ephemeral] })
        }
        const fields = interaction.message.embeds[0].fields.filter(field => field.value != '\u200b');

        try {
            const updatedConfig = await Config.findOneAndUpdate(
                { _id: placeholder, guildId: interaction.guildId },
                {
                    name: fields[0].value,
                    address: encrypt(fields[2].value, process.env.TOKEN),
                    hours: fields[1].value,
                    materials: fields[3].value,
                    channels: currentConfig.channels,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updatedConfig) {
                return await interaction.update({ content: `❌ Impossible de trouver cette configuration.`, embeds: [], components: [], flags: [MessageFlags.Ephemeral] });
            }
            setConfigCache(client, updatedConfig);

            return await interaction.update({ content: `✅ La configuration \`${updatedConfig.name}\` a bien été modifiée !`, embeds: [], components: [], flags: [MessageFlags.Ephemeral] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur est survenue lors de la mise à jour de la configuration !", flags: [MessageFlags.Ephemeral] });
        }
        client.placeholder.delete(interaction.applicationId);
    }
}

