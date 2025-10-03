const mongoose = require("mongoose");

const LanSchema = new mongoose.Schema({
  name: { type: String, required: true },

  channels: {
    category: { type: String, required: true },
    general: { type: String },
    information: { type: String },
    picture: { type: String },
    logistique: { type: String },
    voice: [{ type: String }]
  },

  config: { type: mongoose.Schema.Types.ObjectId, ref: "Config", required: true },

  startedAt: { type: Date, required: true },
  endedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model("lans", LanSchema);