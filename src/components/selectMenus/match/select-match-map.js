const { EmbedBuilder } = require("discord.js");
const { Match } = require('../../../class/Match');

module.exports = {
    data: {
        name: "select-match-map"
    },
    async execute(interaction, client) {
        const { tournaments } = client;
        const info = interaction.values[0].split(";");
        const map = info[0]
        const tournament = tournaments.get(info[1]);

        const message = `# Création de Match\nCet espace est dédié à la création de match pour le tournois ${tournament.name}.\n\n# Informations\n\`\`\`diff\n+ Le Match à bien été archiver avec succès !\`\`\``;
        
        const messageId = interaction.message.content.split("-# Message ID : ")[1];
        const messageNeedToBeEdited = await client.channels.cache.get(interaction.channelId).messages.fetch(messageId);
        
        const embedStats = messageNeedToBeEdited.embeds[0];

        const match = new Match(tournament.teams[0], tournament.teams[1], map);
            
        tournament.teams.forEach(team => {
            for (const player of team.players) {
                match.addPlayerStats(player, 0, 0)
            }
        })
        match.updateScore(0, 0);
        tournament.addMatch(match);
        match.save(tournament);

        embedStats.data.fields = embedStats.data.fields.map(field => {
            if (field.name === '**Nombre de match(s)**') {
              return {
                ...field,
                value: `> ${tournament.matches.length}`
              };
            }
            return field;
        });
        const embedStatsEdited = new EmbedBuilder(embedStats.data);


        await messageNeedToBeEdited.edit({ embeds: [ embedStatsEdited ]});
        await interaction.update({ content: message, components: [] });
    }
}