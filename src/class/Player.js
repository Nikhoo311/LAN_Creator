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
    constructor(name) {
        this.id = generateSlug(name);
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

    
}

module.exports = { Player };
