const { readFileSync, writeFile } = require("fs");
const { Player } = require("./Player");

const { generateSlug } = require('../functions/utils/generateSlug');
const { promises } = require("fs");
class Team {
    /**
     * Représente une team de joueurs
     * @param {String} name Nom de la team
     * @param {Player} players Liste de joueurs présent dans la team
     */
    static #file = "./config/tournament.json";
    constructor(name, players, id = null, voiceChannel = null) {
        this.id = id !== null ? id : generateSlug(name);
        this.name = name;
        this.players = players ? players : [];
        this.voiceChannel = voiceChannel !== null ? voiceChannel : ""
    }

    getPlayerById(playerId) {
        return this.players.find(p => p.id == playerId);
    }

    addPlayer(player) {
        this.players.push(player);
    }

    getTeamFromPlayer(playerName) {
        return this.players.some(p => p.name === playerName) ? this.name : null;
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p.name !== player.name);
    }

    /**
    * Save a Team in a file
    */
    reload(tournament) {
        try {
            const tournamentSaveFile = Team.getFile();

            const targetTournament = tournamentSaveFile.find(t => t.id === tournament.id);
            if (!targetTournament) throw new Error('Tournoi introuvable');

            const originalLength = targetTournament.teams.length;
            targetTournament.teams = targetTournament.teams.filter(team => team.id !== this.id);

            if (originalLength === targetTournament.teams.length) {
                logger.warn(`Aucune team avec l'ID ${this.id} trouvé dans ce tournoi.`);
            }
            targetTournament.teams.push(this);

            writeFile(Team.#file, JSON.stringify(tournamentSaveFile, null, 4), err => {
                if (err) throw new Error("/!\\ Erreur : Impossible d'écrire dans le fichier tournament.json");
            });
        } catch (error) {
            console.error("Erreur dans Team.delete :", error.message);
        }
    }

    /**
    * Save Team voice channel in a file
    */
    async registerVoiceChannel(tournament, voiceChannelId) {
        try {
            let obj = {
                id: this.id,
                name: this.name,
                voiceChannel: voiceChannelId,
                players: this.players
            }
            let tournamentSaveFile = Team.getFile();

            const index = tournamentSaveFile.findIndex(tourn => tourn.id === tournament.id);
            
            if (index === -1) {
                throw new Error(`Tournoi '${tournament.name}' introuvable dans le fichier.`);
            }

            const teamIndex = tournamentSaveFile[index].teams.findIndex(team => team.id === this.id);

            if (teamIndex !== -1) {
                tournamentSaveFile[index].teams[teamIndex] = obj;
            } else {
                tournamentSaveFile[index].teams.push(obj);
            }
            await promises.writeFile(Team.#file, JSON.stringify(tournamentSaveFile, null, 4));
       } catch (error) {
            console.error(error)
       }
    }

    setVoiceChannel(voiceChannelId = "") {
        this.voiceChannel = voiceChannelId;
    }
    
    static fromJson(jsonObject) {
        const id = jsonObject.id;
        const name = jsonObject.name;
        const voiceChannel = jsonObject.voiceChannel

        const players = [];
        jsonObject.players.forEach(playerJson => {
            const player = Player.fromJson(playerJson);
            players.push(player);
        });

        return new Team(name, players, id, voiceChannel);
    }
    
    static getFile() {
        try {
            return JSON.parse(readFileSync(this.#file, "utf-8"));
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = { Team }