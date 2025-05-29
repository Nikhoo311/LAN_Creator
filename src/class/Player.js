const { generateSlug } = require("../functions/utils/generateSlug");

class Player {
    constructor(name, id = null, totalKills = null, totalDeaths = null) {
        this.id = id !== null ? id : generateSlug(name);
        this.name = name;
        this.totalKills = totalKills !== null ? totalKills : 0;
        this.totalDeaths = totalDeaths !== null ? totalDeaths : 0;
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

        return new Player(name, id, totalKills, totalDeaths)
    }
}

module.exports = { Player };
