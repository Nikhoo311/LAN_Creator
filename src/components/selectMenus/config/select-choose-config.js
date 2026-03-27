const { MessageFlags } = require("discord.js");
const { getGuildConfig, getChosenConfigName, setChosenConfigName } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "select-choose-config"
    },
    async execute(interaction, client) {
        const id = interaction.values[0];
        const doc = getGuildConfig(client, id, interaction.guildId);
        if (!doc) {
            return interaction.reply({ content: "❌ Configuration introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const previous = getChosenConfigName(client, interaction.guildId) || "Aucune";
        const message = `Vous avez choisi de mettre la configuration : \`${doc.name}\`\nLa configuration précédente était : \`${previous}\``;

        try {
            await setChosenConfigName(client, interaction.guildId, doc.name);
            interaction.update({ content: `✅ ${message}`, embeds: [], components: [], flags: [MessageFlags.Ephemeral]});
        } catch (error) {
            interaction.reply({ content: "❌ Une erreur est survenue lors de l'enregistrement du choix de configuration.\n" + error, flags: [MessageFlags.Ephemeral] });
        }
    }
}
