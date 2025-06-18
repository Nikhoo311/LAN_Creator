const { Match } = require("../../../class/Match");
const { Tournament } = require("../../../class/Tournament");
const { generateSlug } = require("../../../functions/utils/generateSlug");

module.exports = {
    data: {
        name: "save-match-btn"
    },
    async execute(interaction, client) {
        const { tournaments } = client;
        const matchId = interaction.message.embeds[0].data.footer.text.match(/M\+[a-zA-Z0-9]+/)[0];
        const tournamentId = interaction.message.embeds[0].data.footer.text.match(/T\+[a-zA-Z0-9]+/)[0];

        /**
         * @type Tournament
         */
        const tournament = tournaments.get(tournamentId);
        /**
         * @type Match
         */
        const match = tournament.getMatchById(matchId);
        
        const embedStats = interaction.message.embeds[0];
        const scoreString = embedStats.data.description.split("# Score : ")[1].split(" - ");
        const [scoreTeamA, scoreTeamB] = scoreString.map(Number);
        const winningTeam =
            scoreTeamA > scoreTeamB ? match.teams[0] :
            scoreTeamB > scoreTeamA ? match.teams[1] :
            null;
        match.updateScore(scoreTeamA, scoreTeamB);
        match.setWinner(winningTeam);
        
        embedStats.data.fields.forEach(field => {
            const fieldValueArray = field.value.split('\n');
            const teamMatch = match.getTeamById(generateSlug(fieldValueArray[0].split('> ')[1]));
            const teamTournament = tournament.getTeamById(generateSlug(fieldValueArray[0].split('> ')[1]));
            
            for (let i = 0; i < fieldValueArray.length; i++) {
                const line = fieldValueArray[i];
                const mentionMatch = line.match(/- <@!?(\d+)>/);
                if (mentionMatch) {
                    const userId = mentionMatch[1];
                    const score = fieldValueArray[i + 1] || "0/0";
                    const [kills, deaths] = score.split("/");
                    const member = interaction.guild.members.cache.get(userId);
                    const displayName = member ? member.displayName : `Inconnu (${userId})`;
                    
                    const player = teamMatch.getPlayerById(generateSlug(displayName));

                    const p = teamTournament.getPlayerById(generateSlug(displayName));

                    match.addPlayerStats(player, Number(kills), Number(deaths));
                    p.addMatchStats(Number(kills), Number(deaths));
                    
                }
            }
        });
        // tournament.delete();
        // tournament.save();
    }
}