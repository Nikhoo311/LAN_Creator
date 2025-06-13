module.exports = {
    data: {
        name: "suppr-tournament-no-btn"
    },
    async execute (interaction, client) {
        const tournamentID = interaction.message.content.split("# ID: \`\`")[1].split("\`\`")[0];
        const tournament = client.tournaments.get(tournamentID);
        const message = `# Espace de suppression du tournois \`\`${tournament.name}\`\`\nCeci est un espace qui permet de supprimer un tournois facilement en un clic !\n# Informations\n\`\`\`diff\n- Annulation de la suppression du tournois ${tournament.name}\`\`\``
        interaction.update({ content: message, embeds: [], components: [] });
    }
}