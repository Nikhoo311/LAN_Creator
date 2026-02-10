const mongoose = require("mongoose");

// Activité journalière (optionnel si tu veux suivre par jour)
const DailyActivitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  messages: { type: Number, default: 0 },
  voiceMinutes: { type: Number, default: 0 },
}, { _id: false });

// Stats par jeu
const GameStatsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  playtimeMinutes: { type: Number, default: 0 }, // temps total cumulé
  players: { type: Number, default: 0 }, // nb de joueurs uniques ayant joué
}, { _id: false });

const LanStatsSchema = new mongoose.Schema({
  lanName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD

  totalMessages: { type: Number, default: 0 },

  // Temps vocal total et pic d'affluence
  voice: {
    totalMinutes: { type: Number, default: 0 },
    peakOnline: { type: Number, default: 0 },
  },

  // Participants
  participants: {
    list: [{ type: String }], // ids Discord des participants
    count: { type: Number, default: 0 }, // nb de participants au moins une fois
    maxVoiceUser: { type: String, default: null }, // id du membre le plus en vocal
    maxVoiceMinutes: { type: Number, default: 0 } // temps vocal de ce membre
  },

  // Activité par jour
  daily: [DailyActivitySchema],

  // Jeux
  games: [GameStatsSchema],

  // Jeu le plus joué (calculé)
  topGame: {
    name: { type: String, default: null },
    playtimeMinutes: { type: Number, default: 0 }
  }

}, { timestamps: true });

module.exports = mongoose.model("lan_stats", LanStatsSchema);