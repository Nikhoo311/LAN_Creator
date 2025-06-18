const { generateSlug } = require("../functions/utils/generateSlug");

class Player {
    constructor(name, id = null) {
        this.id = id !== null ? id : generateSlug(name);
        this.name = name;
        this.totalKills = 0;
        this.totalDeaths = 0;
    }

    addMatchStats(kills, deaths) {
        this.totalKills += kills;
        this.totalDeaths += deaths;
    }

    getTotalStats() {
        return {
            name: this.name,
            totalKills: this.totalKills,
            totalDeaths: this.totalDeaths,
        };
    }

    static fromJson(jsonObject) {
        const id = jsonObject.id;
        const name = jsonObject.name;
        const totalKills = jsonObject.totalKills;
        const totalDeaths = jsonObject.totalDeaths;

        const player = new Player(name, id)
        player.totalKills = totalKills;
        player.totalDeaths = totalDeaths;

        return player;
    }
}

module.exports = { Player };
