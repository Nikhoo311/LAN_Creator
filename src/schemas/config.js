const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adress: { type: String, required: true },
  hours: { type: String, required: true },
  materials: { type: String, default: "Aucun" }
}, {
  timestamps: true // createdAt / updatedAt auto
});

module.exports = mongoose.model("config", ConfigSchema);
