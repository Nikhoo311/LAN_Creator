const { createCanvas } = require('canvas');
const { readFileSync, writeFile } = require("fs");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { Team } = require('./Team');
const { Match } = require('./Match');

function generateID() {
    const uniqueString = uuidv4();
    const hash = crypto.createHash('sha256');
    hash.update(uniqueString + (Date.now() + Math.random() * Date.now().toFixed(3)));
    
    const uniqueHash = "T+" + hash.digest('hex').substring(0, 10);
    return uniqueHash;
}

class Tournament {
    static #file = "./config/tournament.json";
    constructor(lanName, name, game, id = null, teams = null, matches = null, scoreA = null, scoreB = null) {
        this.id = id !== null ? id : generateID();
        this.name = name;
        this.lanName = lanName;
        this.game = game;
        this.teams = teams !== null ? teams : [];
        this.matches = matches !== null ? matches : [];
        this.scoreA = scoreA !== null ? scoreA : 0;
        this.scoreB = scoreB !== null ? scoreB : 0;
    }

    updateScore(scoreA, scoreB) {
        this.scoreA = scoreA;
        this.scoreB = scoreB;
    }

    addTeam(team) {
        if (this.teams.length == 2) {
            throw new Error("[Tournament.js]: Maximum length reached (2 max)");
        }
        this.teams.push(team);
    }

    addMatch(match) {
        this.matches.push(match);
    }

    getTotalPlayerStats() {
        let stats = {};
        for (let team of this.teams) {
            for (let player of team.players) {
                stats[player.name] = player.getTotalStats();
            }
        }
        return stats;
    }

    drawBracket() {
        const width = 800;
        const height = 550;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Texte principal
        ctx.fillStyle = 'black';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        
        // Titre du tournoi
        ctx.fillText(this.name, width / 2, 40);
        
        // Affichage des équipes et du score
        ctx.font = '20px Arial';
        ctx.fillText(this.teams[0].name, width / 2 - 120, 80);
        ctx.fillText(this.teams[1].name, width / 2 + 120, 80);
        
        // Score au centre
        ctx.font = 'bold 26px Arial';
        ctx.fillText(`${this.scoreA.toString()} - ${this.scoreB.toString()}`, width / 2, 85);
        
        // Ligne de séparation
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(50, 110);
        ctx.lineTo(width - 50, 110);
        ctx.stroke();
        
        // "Statistiques globales"
        ctx.font = 'bold 24px Arial';
        const statsText = "Statistiques globales";
        const statsY = 150;
        ctx.fillText(statsText, width / 2, statsY);
        
        // Soulignement du texte
        const textWidth = ctx.measureText(statsText).width;
        const underlineY = statsY + 5;
        ctx.beginPath();
        ctx.moveTo(width / 2 - textWidth / 2, underlineY);
        ctx.lineTo(width / 2 + textWidth / 2, underlineY);
        ctx.stroke();

        // Trouver le nom de joueur le plus long pour ajuster la largeur des tableaux
        let maxNameLength = 0;
        this.teams.forEach(team => {
            team.players.forEach(player => {
                const textWidth = ctx.measureText(player.name).width;
                if (textWidth > maxNameLength) {
                    maxNameLength = textWidth;
                }
            });
        });

        // Largeur des colonnes basée sur la taille du nom le plus long
        const columnWidth = maxNameLength + 40;
        const statColumnWidth = 60;
        const tableWidth = columnWidth + statColumnWidth * 2;
        const gapBetweenTables = 80;
        const totalTablesWidth = tableWidth * 2 + gapBetweenTables;

        // Centrage des tableaux
        const tableStartX_A = (width - totalTablesWidth) / 2;
        const tableStartX_B = tableStartX_A + tableWidth + gapBetweenTables;
        const tableStartY = 200;
        const rowHeight = 40;

        // Fonction pour dessiner un tableau d'équipe
        function drawTeamTable(x, y, teamName, players) {
            ctx.fillStyle = 'black';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(teamName, x + tableWidth / 2, y - 10);

            // En-tête du tableau
            ctx.fillStyle = 'lightgray';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, columnWidth, rowHeight);
            ctx.fillRect(x, y, columnWidth, rowHeight);
            ctx.strokeRect(x + columnWidth, y, statColumnWidth, rowHeight);
            ctx.fillRect(x + columnWidth, y, statColumnWidth, rowHeight);
            ctx.strokeRect(x + columnWidth + statColumnWidth, y, statColumnWidth, rowHeight);
            ctx.fillRect(x + columnWidth + statColumnWidth, y, statColumnWidth, rowHeight);

            // Contenu de l'en-tête
            ctx.fillStyle = 'black';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = "center";
            ctx.fillText("Nom", x + columnWidth / 2, y + rowHeight / 2 + 5);
            ctx.fillText("Kills", x + columnWidth + statColumnWidth / 2, y + rowHeight / 2 + 5);
            ctx.fillText("Morts", x + columnWidth + statColumnWidth + statColumnWidth / 2, y + rowHeight / 2 + 5);

            // Dessin des stats des joueurs
            players.forEach((player, index) => {
                let rowY = y + (index + 1) * rowHeight;

                // Fond des cellules
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, rowY, columnWidth, rowHeight);
                ctx.fillRect(x, rowY, columnWidth, rowHeight);
                ctx.strokeRect(x + columnWidth, rowY, statColumnWidth, rowHeight);
                ctx.fillRect(x + columnWidth, rowY, statColumnWidth, rowHeight);
                ctx.strokeRect(x + columnWidth + statColumnWidth, rowY, statColumnWidth, rowHeight);
                ctx.fillRect(x + columnWidth + statColumnWidth, rowY, statColumnWidth, rowHeight);

                // Texte centré dans les colonnes
                ctx.fillStyle = 'black';
                ctx.font = '16px Arial';
                ctx.textAlign = "center";
                ctx.fillText(player.name, x + columnWidth / 2, rowY + rowHeight / 2 + 5);
                ctx.fillText(player.totalKills.toString(), x + columnWidth + statColumnWidth / 2, rowY + rowHeight / 2 + 5);
                ctx.fillText(player.totalDeaths.toString(), x + columnWidth + statColumnWidth + statColumnWidth / 2, rowY + rowHeight / 2 + 5);
            });
        }

        // Dessiner les tableaux centrés
        if (this.teams.length > 0) {
            drawTeamTable(tableStartX_A, tableStartY, this.teams[0].name, this.teams[0].players);
        }
        if (this.teams.length > 1) {
            drawTeamTable(tableStartX_B, tableStartY, this.teams[1].name, this.teams[1].players);
        }

        return canvas.toBuffer();
    }

    /**
     * Save a Tournament in a file
     */
    save() {
        try {
            let score = {};
            if (this.teams[0]) score[this.teams[0].id] = this.scoreA;
            if (this.teams[1]) score[this.teams[1].id] = this.scoreB;

            let obj = {
                id: this.id,
                name: this.name,
                lanName: this.lanName,
                game: this.game,
                score: score,
                teams: this.teams,
                matches: this.matches,
            };
            const tournamentSaveFile = Tournament.getFile()
            tournamentSaveFile.push(obj);
            
            writeFile(Tournament.#file, JSON.stringify(tournamentSaveFile, null, 4), err => {
               if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'lans.json'")
            })  
        } catch (error) {
           console.error(error);
           throw error;
        }
     }
 
    /**
     * Delete a Tournament in a file
     */
    delete() {
        try {
            let tournamentSaveFile = Tournament.getFile()
            tournamentSaveFile = tournamentSaveFile.filter(item => item.id !== this.id)
            writeFile(Tournament.#file, JSON.stringify(tournamentSaveFile, null, 4), err => {
                if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'tournament.json'")
            })  
        } catch (error) {
            console.error(error)
        }
    }
    static fromJson(jsonObject) {
        const id = jsonObject.id;
        const name = jsonObject.name;
        const lanName = jsonObject.lanName;
        const game = jsonObject.game;
        let scores = [];
        let teams = [];
        jsonObject.teams.forEach(team => {
            teams.push(Team.fromJson(team));            
            scores.push(jsonObject.score[team.id]);
        });
        let matches = [];
        jsonObject.matches.forEach(match => matches.push(Match.fromJson(match)));
        
        return new Tournament(lanName, name, game, id, teams, matches, scores[0], scores[1]);
    }
    static getFile() {
        try {
            return JSON.parse(readFileSync(this.#file, "utf-8"));
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = { Tournament };