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
