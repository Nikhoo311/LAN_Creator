const { createCanvas } = require('canvas');
const { readFileSync, writeFile } = require("fs");
const crypto = require('crypto');
const { Team } = require('./Team');
const logger = require('../functions/utils/Logger');

function generateID() {
    const uniqueString = uuidv4();
    const hash = crypto.createHash('sha256');
    hash.update(uniqueString + (Date.now() + Math.random() * Date.now().toFixed(3)));
    
    const uniqueHash = "M+" + hash.digest('hex').substring(0, 10);
    return uniqueHash;
}

class Match {
    static #file = "./config/tournament.json";
    constructor(team1, team2, mapName, id = null, score1 = null, score2 = null, playerStats = null, start = null) {
        this.id = id !== null ? id : generateID();
        this.teams = [team1, team2]
        this.mapName = mapName;
        this.score1 = score1 !== null ? score1 : 0;
        this.score2 = score2 !== null ? score2 : 0;
        this.playerStats = playerStats !== null ? playerStats : {};
        this.playedAt = start !== null ? start : Math.floor(Date.now() / 1000);
        this.winner = null;
        
    }

    updateScore(score1, score2) {
        this.score1 = score1;
        this.score2 = score2;
    }

    addPlayerStats(player, kills, deaths) {
        this.playerStats[player.id] = { name: player.name, kills, deaths };
        player.addMatchStats(kills, deaths);
    }
    
    // getMatchStats() {
    //     return {
    //         map: this.mapName,
    //         score: `${this.team1.name} ${this.score1} - ${this.score2} ${this.team2.name}`,
    //         playerStats: this.playerStats
    //     };
    // }

    drawBracket() {
        const width = 800;
        const height = 650;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Titre
        ctx.fillStyle = 'black';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Match - ${this.mapName}`, width / 2, 40);

        // Score
        ctx.font = 'bold 26px Arial';
        ctx.fillText(`${this.teams[0].name}   ${this.score1} - ${this.score2}   ${this.teams[1].name}`, width / 2, 80);

        // Titre des stats
        ctx.font = 'bold 20px Arial';
        ctx.fillText("Statistiques du match", width / 2, 120);

        const statsY = 120;
        const textWidth = ctx.measureText("Statistiques du match").width;
        const underlineY = statsY + 5;
        ctx.beginPath();
        ctx.moveTo(width / 2 - textWidth / 2, underlineY);
        ctx.lineTo(width / 2 + textWidth / 2, underlineY);
        ctx.stroke();
        
        // Colonnes
        const columnWidth = 200;
        const statColumnWidth = 100;
        const tableStartX = (width - (columnWidth + statColumnWidth * 2)) / 2;
        const tableStartY = 160;
        const rowHeight = 40;

        // En-tête du tableau
        ctx.fillStyle = 'lightgray';
        ctx.fillRect(tableStartX, tableStartY, columnWidth, rowHeight);
        ctx.fillRect(tableStartX + columnWidth, tableStartY, statColumnWidth, rowHeight);
        ctx.fillRect(tableStartX + columnWidth + statColumnWidth, tableStartY, statColumnWidth, rowHeight);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(tableStartX, tableStartY, columnWidth, rowHeight);
        ctx.strokeRect(tableStartX + columnWidth, tableStartY, statColumnWidth, rowHeight);
        ctx.strokeRect(tableStartX + columnWidth + statColumnWidth, tableStartY, statColumnWidth, rowHeight);

        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = "center";
        ctx.fillText("Joueur", tableStartX + columnWidth / 2, tableStartY + rowHeight / 2 + 5);
        ctx.fillText("Kills", tableStartX + columnWidth + statColumnWidth / 2, tableStartY + rowHeight / 2 + 5);
        ctx.fillText("Morts", tableStartX + columnWidth + statColumnWidth + statColumnWidth / 2, tableStartY + rowHeight / 2 + 5);

        // Déterminer les équipes des joueurs
        let playerTeams = {};
        for (const playerName in this.playerStats) {
            for (const team of this.teams) {
                if (team.getTeamFromPlayer(this.playerStats[playerName].name)) {
                    playerTeams[playerName] = team.name;
                    break;
                }
            }
        }

        // Affichage des stats des joueurs
        let index = 0;
        for (const playerName in this.playerStats) {
            let rowY = tableStartY + (index + 1) * rowHeight;

            // Alterner la couleur du fond
            ctx.fillStyle = index % 2 === 0 ? 'white' : '#e0e0e0';
            ctx.fillRect(tableStartX, rowY, columnWidth, rowHeight);
            ctx.fillRect(tableStartX + columnWidth, rowY, statColumnWidth, rowHeight);
            ctx.fillRect(tableStartX + columnWidth + statColumnWidth, rowY, statColumnWidth, rowHeight);

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.strokeRect(tableStartX, rowY, columnWidth, rowHeight);
            ctx.strokeRect(tableStartX + columnWidth, rowY, statColumnWidth, rowHeight);
            ctx.strokeRect(tableStartX + columnWidth + statColumnWidth, rowY, statColumnWidth, rowHeight);

            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            
            ctx.fillText(`[ ${playerTeams[playerName]} ] ${this.playerStats[playerName].name}`, tableStartX + columnWidth / 2, rowY + rowHeight / 2 + 5);
            ctx.fillText(this.playerStats[playerName].kills.toString(), tableStartX + columnWidth + statColumnWidth / 2, rowY + rowHeight / 2 + 5);
            ctx.fillText(this.playerStats[playerName].deaths.toString(), tableStartX + columnWidth + statColumnWidth + statColumnWidth / 2, rowY + rowHeight / 2 + 5);

            index++;
        }

        return canvas.toBuffer();
    }

    /**
    * Save a Match in a file
    */
    save(tournament) {
        try {
            let teamsID = []
            this.teams.forEach(team => {
                teamsID.push(team.id);
            });
            
            let scoreTeam = {};
            if (this.teams[0]) scoreTeam[this.teams[0].id] = this.score1;
            if (this.teams[1]) scoreTeam[this.teams[1].id] = this.score2;

            let playersStatsObj = {};
            for (const playerName in this.playerStats) {
                playersStatsObj[playerName] = { kills: this.playerStats[playerName].kills, deaths: this.playerStats[playerName].deaths } 
            }

            let obj = {
                id: this.id,
                teams: teamsID,
                mapName: this.mapName,
                winner: null, // Modifier pour mettre le winner => faire methode
                score: scoreTeam,
                stats: playersStatsObj,
                playedAt: this.playedAt
            }

            const tournamentSaveFile = Match.getFile()
            tournamentSaveFile.forEach(tourn => {
                if (tourn.id == tournament.id) { tourn.matches.push(obj); }
            })
           
            writeFile(Match.#file, JSON.stringify(tournamentSaveFile, null, 4), err => {
                if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'lans.json'")
            })  
        } catch (error) {
            console.error(error)
        }
    }

    delete(tournament) {
        try {
            const tournamentSaveFile = Match.getFile();

            const targetTournament = tournamentSaveFile.find(t => t.id === tournament.id);
            if (!targetTournament) throw new Error('Tournoi introuvable');

            const originalLength = targetTournament.matches.length;
            targetTournament.matches = targetTournament.matches.filter(match => match.id !== this.id);

            if (originalLength === targetTournament.matches.length) {
                logger.warn(`Aucun match avec l'ID ${this.id} trouvé dans ce tournoi.`);
            }

            writeFile(Match.#file, JSON.stringify(tournamentSaveFile, null, 4), err => {
                if (err) throw new Error("/!\\ Erreur : Impossible d'écrire dans le fichier tournament.json");
            });
        } catch (error) {
            console.error("Erreur dans Match.delete :", error.message);
        }
    }
    
    static fromJson(jsonObject) {
        const id = jsonObject.id;
        const mapName = jsonObject.mapName;
        const winner = jsonObject.winner;
        const playedAt = jsonObject.playedAt;
        let teams = [];
        let scores = [];
        let file = Match.getFile();
        
        file.forEach(tournament => {
            tournament.teams.forEach(fileTeam => {
                jsonObject.teams.forEach(team => {
                    if (team === fileTeam.id) {
                        teams.push(Team.fromJson(fileTeam));
                    }
                })
                scores.push(jsonObject.score[fileTeam.id]);  
            })
        });

        const score1 = scores[0];
        const score2 = scores[1];
        
        return new Match(teams[0], teams[1], mapName, id, score1, score2, jsonObject.stats, playedAt);
    }

    static getFile() {
        try {
            return JSON.parse(readFileSync(Match.#file, "utf-8"));
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = { Match };