const { EmbedBuilder, MessageFlags } = require("discord.js");
const { color } = require("../../../../config/config.json");
const Config = require("../../../schemas/config");
const { removeConfigCache, getGuildConfig } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "select-suppr-config"
    },
    async execute(interaction, client) {
        const selectedIds = interaction.values;
        try {
            const labels = [];
            for (const id of selectedIds) {
                const doc = getGuildConfig(client, id, interaction.guildId);
                if (doc) labels.push(doc.name);
            }

            const result = await Config.deleteMany({
                guildId: interaction.guildId,
                _id: { $in: selectedIds },
            });

            if (result.deletedCount === 0) {
                return interaction.update({
                    content: "⚠️ Aucune configuration trouvée à supprimer.",
                    embeds: [],
                    components: [],
                    flags: [MessageFlags.Ephemeral]
                });
            }

            for (const id of selectedIds) {
                removeConfigCache(client, id);
            }
            const names = labels.map((name) => `* **${name}**`).join('\n');

            const embedSuppr = new EmbedBuilder()
                .setColor(color.red)
                .setTitle("🗑️ Configurations supprimées")
                .setDescription(names);

            const message = `${result.deletedCount > 1 ? "Les configurations ont" : "La configuration a"} bien été supprimé${result.deletedCount > 1 ? "s" : ""} avec succès !`;

            interaction.update({ content: `✅ ${message}`, embeds: [embedSuppr], components: [], flags: [MessageFlags.Ephemeral] });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: "❌ Une erreur est survenue lors de la suppression des configurations !", flags: [MessageFlags.Ephemeral] });
        }
    }
};