const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { color } = require("../../../config/config.json")
const { Team } = require("../../class/Team")
const { Tournament } = require("../../class/Tournament")
const { Player } = require("../../class/Player");
const { Match } = require("../../class/Match");
module.exports = {
    name: "brackets",
    categorie: "Utilitaires",
    data: new SlashCommandBuilder()
        .setName("brackets")
        .setDescription('Permet d\'afficher les brackets d\'un tournois'),

    async execute(interaction, client) {
        const p1 = new Player("Nikho311");
        const p2 = new Player("Remoustache");
        const p3 = new Player("Dermath");
        const p4 = new Player("Joueur B");
        const p5 = new Player("Joueur B2");
        const p6 = new Player("Joueur B3");
        const p7 = new Player("Coucou");
        const p8 = new Player("Coucou2");
        const p9 = new Player("Coucou3");
        const p10 = new Player("Player Name")
        
        const team1 = new Team("Team A");
        team1.addPlayer(p1);
        team1.addPlayer(p2);
        team1.addPlayer(p3);
        team1.addPlayer(p7);
        team1.addPlayer(p8);
        
        const team2 = new Team("Team B");
        
        
        team2.addPlayer(p4);
        team2.addPlayer(p5);
        team2.addPlayer(p6);
        team2.addPlayer(p9);
        team2.addPlayer(p10);
        
        
        const tournament = new Tournament("1b70c6f1c2a14727973d9f726774b79d25fa58478bc5f0a5880bcc05193e6d5c" ,"CS2 Tournament", "Counter-Strike");
        
        tournament.addTeam(team1);
        tournament.addTeam(team2);
        
        const match1 = new Match(team1, team2, "Dust II");

        // match1.addPlayerStats(p1, 10, 5);
        // match1.addPlayerStats(p2, 8, 7);
        // match1.addPlayerStats(p3, 6, 9);
        // match1.addPlayerStats(p4, 12, 4);
        // match1.addPlayerStats(p5, 7, 8);
        // match1.addPlayerStats(p6, 5, 10);
        
        match1.updateScore(1, 2);
        
        /// Faire un truc / bouton pour faire sauvegarder un tournois
        tournament.save()
        // autre bouton -> créer un match et a la fin on sauvegarde
        setTimeout(() => {
            tournament.addMatch(match1);
            // match1.save(tournament);
            console.log('test');
            
        }, 4000);

        const match2 = new Match(team1, team2, "Inferno");
        match2.addPlayerStats(p1, 1, 1);
        match2.addPlayerStats(p2, 1, 1);
        match2.addPlayerStats(p3, 1, 1);
        match2.addPlayerStats(p4, 1,1);
        match2.addPlayerStats(p5, 1, 1);
        match2.addPlayerStats(p6, 1, 1);
        match2.addPlayerStats(p10, 5, 10);
        tournament.addMatch(match2);

        // match1.addPlayerStats(p7, 5, 10);
        // match1.addPlayerStats(p8, 5, 10);
        // match1.addPlayerStats(p9, 5, 10);
        // match1.addPlayerStats(p10, 5, 10);
        tournament.updateScore(1,2)
        const bracketImage = match1.drawBracket();
        
        // team2.save(tournament);

        await interaction.reply({
            files: [{ attachment: bracketImage, name: 'bracket_image.png' }],
        });
    }
}