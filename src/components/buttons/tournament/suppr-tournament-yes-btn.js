const logger = require("../../../functions/utils/Logger");

module.exports = {
    data: {
        name: "suppr-tournament-yes-btn"
    },
    async execute (interaction, client) {
        const tournamentID = interaction.message.content.split("# ID: \`\`")[1].split("\`\`")[0];
        const tournament = client.tournaments.get(tournamentID);
        
        const message = `# Espace de suppression du tournois \`\`${tournament.name}\`\`\nCeci est un espace qui permet de supprimer un tournois facilement en un clic !\n## Informations\n\`\`\`diff\n+ Le tournoi ${tournament.name} a été supprimé avec succès !\`\`\``

        try {
            client.tournaments.delete(tournament.id);
            await tournament.delete();
    
            interaction.update({ content: message, embeds: [], components: [] });
        } catch (error) {
            console.error(error);
            logger.error(error);

            interaction.update({ content: '❌ Une erreur est survenue lors de la supression...', embeds: [], components: [] });
        }
    }
}