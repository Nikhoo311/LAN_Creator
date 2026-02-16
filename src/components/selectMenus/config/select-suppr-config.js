const { EmbedBuilder, MessageFlags } = require("discord.js");
const { color } = require("../../../../config/config.json");
const Config = require("../../../schemas/config");

module.exports = {
    data: {
        name: "select-suppr-config"
    },
    async execute(interaction, client) {
        const selectedNames = interaction.values;
        try {
            // Suppression de toutes les configs dont le name est dans selectedNames
            const result = await Config.deleteMany({ name: { $in: selectedNames } });

            if (result.deletedCount === 0) {
                return interaction.update({
                    content: "⚠️ Aucune configuration trouvée à supprimer.",
                    embeds: [],
                    components: [],
                    flags: [MessageFlags.Ephemeral]
                });
            }

            selectedNames.forEach(conf => {
                client.configs.delete(conf)
            });
            const names = selectedNames.map(name => `* **${name}**`).join('\n');

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