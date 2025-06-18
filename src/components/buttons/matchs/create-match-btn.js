const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { readFileSync } = require('fs');
const { Match } = require('../../../class/Match');

module.exports = {
    data: {
        name: "create-match-btn"
    },
    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] })
        const{ tournaments } = client;
        
        let embedStats = interaction.message.embeds[0];
        const tournament = tournaments.get(embedStats.data.footer.text.split('ID : ')[1]);

        const possibleGamesChoices = JSON.parse(readFileSync(`./config/bd.json`, "utf-8"))["tournamentGames"];
        let gameSelected = embedStats.fields[0].value.split(" ").slice(2).join(" ");

        const game = possibleGamesChoices.find(game => gameSelected == game.name);
        let message = `# Création de Match\nCet espace est dédié à la création de match pour le tournois ${tournament.name}.`;

        let selectMapForMatch = new StringSelectMenuBuilder()
            .setCustomId('select-match-map')
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder("Choisir une map");
        
        if (game.maps) {
            game.maps.forEach(map => {
                selectMapForMatch.addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setEmoji("🗺️")
                    .setLabel(map)
                    .setValue(`${map};${tournament.id}`)
                )
            });
            message += ` Merci de choisir la map sur laquelle se déroulera le match\n\n-# Message ID : ${interaction.message.id}`
            await interaction.editReply({ content: message, components: [new ActionRowBuilder().addComponents(selectMapForMatch)] });
        } 
        else {
            const match = new Match(tournament.teams[0], tournament.teams[1], "");
            
            tournament.teams.forEach(team => {
                for (const player of team.players) {
                    match.addPlayerStats(player, 0, 0)
                }
            })
            match.updateScore(0, 0);
            tournament.addMatch(match);
            match.save(tournament);

            const messageNeedToBeEdited = interaction.message;
            message += `\n\n# Informations\n\`\`\`diff\n+ Le Match à bien été archiver avec succès !\`\`\``;

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
            await interaction.editReply({ content: message });
        }
    }
}