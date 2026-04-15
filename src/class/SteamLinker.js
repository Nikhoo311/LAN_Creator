const fetch = require("node-fetch");
const fs = require("fs");

class SteamLinker {
  #apiKey;
  #dbPath;
  #db;

  constructor(steamApiKey, dbPath = "./links.json") {
    this.#apiKey = steamApiKey;
    this.#dbPath = dbPath;
    this.#db = this.#loadDb();
  }

  // ── DB ─────────────────────────────────────────────────────────────

  #loadDb() {
    if (!fs.existsSync(this.#dbPath)) fs.writeFileSync(this.#dbPath, "{}");
    return JSON.parse(fs.readFileSync(this.#dbPath, "utf8"));
  }

  #saveDb() {
    fs.writeFileSync(this.#dbPath, JSON.stringify(this.#db, null, 2));
  }

  // ── Linking ────────────────────────────────────────────────────────

  /**
   * Lie un discordId à un steamId (SteamID64, 17 chiffres).
   * @returns {{ success: boolean, error?: string }}
   */
  link(discordId, steamId) {
    if (!/^\d{17}$/.test(steamId)) {
      return { success: false, error: "SteamID invalide. Il doit faire exactement 17 chiffres." };
    }
    this.#db[discordId] = steamId;
    this.#saveDb();
    return { success: true };
  }

  /**
   * Supprime le lien d'un utilisateur Discord.
   */
  unlink(discordId) {
    if (!this.#db[discordId]) return false;
    delete this.#db[discordId];
    this.#saveDb();
    return true;
  }

  /**
   * Retourne le SteamID64 lié à un discordId, ou null.
   */
  getSteamId(discordId) {
    return this.#db[discordId] ?? null;
  }

  /**
   * Retourne true si l'utilisateur a déjà lié son compte.
   */
  isLinked(discordId) {
    return !!this.#db[discordId];
  }

  // ── Steam API ──────────────────────────────────────────────────────

  /**
   * Récupère la liste des jeux d'un SteamID64.
   * Retourne un tableau de jeux ou lance une erreur.
   * 
   * Chaque jeu contient :
   *   - appid         : number
   *   - name          : string
   *   - playtime_forever : number  (minutes)
   *   - img_icon_url  : string    (code de l'icône)
   *   - iconUrl       : string    (URL complète de l'icône)
   */
  async getGames(steamId) {
    const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/");
    url.searchParams.set("key", this.#apiKey);
    url.searchParams.set("steamid", steamId);
    url.searchParams.set("include_appinfo", "true");
    url.searchParams.set("include_played_free_games", "true");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Steam API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    const games = data.response?.games ?? [];

    return games.map((g) => ({
      ...g,
      iconUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`,
    }));
  }

  /**
   * Récupère les jeux d'un utilisateur Discord (doit être lié).
   * Retourne { games, steamId } ou lance une erreur.
   */
  async getGamesForDiscordUser(discordId) {
    const steamId = this.getSteamId(discordId);
    if (!steamId) throw new Error("Compte Steam non lié. Utilise `/link <steamid>`.");

    const games = await this.getGames(steamId);
    return { games, steamId };
  }

  /**
   * Retourne les N jeux les plus joués d'un utilisateur Discord.
   */
  async getTopGames(discordId, limit = 10) {
    const { games, steamId } = await this.getGamesForDiscordUser(discordId);
    const sorted = games.sort((a, b) => b.playtime_forever - a.playtime_forever);
    return { games: sorted.slice(0, limit), total: games.length, steamId };
  }
}

module.exports = SteamLinker;