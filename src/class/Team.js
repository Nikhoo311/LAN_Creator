const { readFileSync, writeFile } = require("fs");

function generateSlug(str) {
    return str
      .normalize("NFD")                      // Décompose les accents
      .replace(/[\u0300-\u036f]/g, "")       // Supprime les diacritiques
      .replace(/[^a-zA-Z0-9\s_]/g, "")       // Supprime les caractères spéciaux (mais garde underscore)
      .trim()                                // Enlève les espaces inutiles
      .replace(/\s+/g, "_")                  // Remplace les espaces par des underscores
      .replace(/_+/g, "_")                   // Supprime les doubles underscores
      .toLowerCase();
}

class Team {
    /**
     * Représente une team de joueurs
     * @param {String} name Nom de la team
     * @param {Player} players Liste de joueurs présent dans la team
     */
    static #file = "./config/tournament.json";
    constructor(name, players) {
        this.id = generateSlug(name);
        this.name = name;
        this.players = players ? players : [];
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
    save(tournament) {
    //     try {
    //         let playersID = []
    //         this.players.forEach(player => {
    //             playersID.push(player.id);
    //         });
    //         let obj = {
    //             id: this.id,
    //             name: this.name,
    //             players: playersID
    //         }
    //         console.log(Team.#file);
            
    //         const tournamentSaveFile = Team.getFile()
    //         tournamentSaveFile.forEach(tourn => {
    //             if (tourn.lanId == tournament.lanId) {
    //                 tourn.teams.push(obj);
    //             }
    //         })
           
    //         writeFile(Team.#file, JSON.stringify(tournamentSaveFile, null, 4), err => {
    //             if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'lans.json'")
    //         })  
    //    } catch (error) {
    //         console.error(error)
    //    }
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