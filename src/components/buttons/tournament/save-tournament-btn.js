const { Player } = require("../../../class/Player");
const { Team } = require("../../../class/Team");
const { Tournament } = require("../../../class/Tournament");

module.exports = {
    data: {
        name: "save-tournament-btn"
    },
    async execute(interaction, client) {
        const lanName = interaction.message.content.split('\n')[0].split('``')[1];
        const infoEmbed = interaction.message.embeds[0].fields;
        let result = {
            teams: []
        };

        const cleaned = infoEmbed.filter(f =>
            f.value.trim() !== '' && f.name.trim() !== ''
        );

        cleaned.forEach(field => {
            if (field.name.includes('Nom du tournois')) {
                result.tournamentName = field.value.replace('> ', '').trim();
            } else if (field.name.includes('Jeu')) {
                result.game = field.value
                    .replace('> ', '')
                    .replace(/<:[^>]+>\s*/, '') // retire "<:...> "
                    .trim();
            } else if (field.name.includes('Équipes') || field.name === '​') {
                const lines = field.value.split('\n');
                const name = lines[0].replace('> ', '').trim();
                if (name == '​') return;
                const team = new Team(name);

                const players = lines.slice(1).map(p => p.replace('* <@', '').replace('>', '').trim());

                players.forEach(player => {
                    let playerObject = new Player(interaction.guild.members.cache.get(player).displayName);
                    team.addPlayer(playerObject);
                })

                result.teams.push(team);
            }
        });
        const tournament = new Tournament(lanName, result.tournamentName, result.game)
        result.teams.forEach(team => tournament.addTeam(team));

        try {
            tournament.save();
            client.tournaments.set(tournament.id, tournament);
            await interaction.update({ content: `# Création de Tournois pour \`\`${lanName}\`\`\nCet espace est dédié à la création de Tournois Multi-jeux !\n# Informations :\n\`\`\`diff\n+ Le tournois ${result.tournamentName} à bien été créer avec succès !\n\`\`\``, embeds: [], components: [] });
        } catch (error) {
            console.error(error);
            await interaction.update({ content: `# Création de Tournois pour \`\`${lanName}\`\`\nCet espace est dédié à la création de Tournois Multi-jeux !\n# Informations :\n\`\`\`diff\n- La sauvegarde du tournois ${result.tournamentName} a échouer...\n\nErreur :\n- ${error}\n\`\`\``, embeds: [], components: [] });
        }
    }
}