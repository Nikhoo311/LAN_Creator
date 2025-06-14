const { EmbedBuilder } = require("@discordjs/builders");

module.exports = {
    data: {
        name: "select-match",
        multi: "select-suppr-match"
    },
    async execute(interaction, client) {
        const info = interaction.values[0];

        const { tournaments } = client;
        const messageId = interaction.message.content.split("\n").map(line => {
            const m = line.match(/\b\d{18,20}\b/);
            if (m) {
                return m[0];
            }
        }).filter(line => line != null)[0];

        const message = await client.channels.cache.get(interaction.channelId).messages.fetch(messageId);
        
        const embedStats = message.embeds[0].data;
        
        const tournament = tournaments.get(embedStats.footer.text.split('ID : ')[1]);
        if (interaction.customId == "select-suppr-match") {
            const match = tournament.matches.find(match => match.id === info);
            tournament.matches = tournament.matches.filter(match => match.id != info);
            match.delete(tournament);
            
            embedStats.fields = embedStats.fields.map(field => {
                if (field.name === '**Nombre de match(s)**') {
                  return {
                    ...field,
                    value: `> ${tournament.matches.length}`
                  };
                }
                return field;
            });

            const embedStatsEdited = new EmbedBuilder(embedStats);
            await message.edit({ embeds: [ embedStatsEdited ]});
            const messageContent = `# Espace de suppression des Matchs du tournois \`${tournament.name}\`\nCet espace est dédié a la suppression des Matchs d'un Tournois. Cette action est **définitive** ! Il faut faire attention !\n\n# Informations\n\`\`\`diff\n+ La suppression du match ${match.id} a bien été effectuée.\`\`\``;
            await interaction.update({ content: messageContent, components: [] });
        }
    }
}