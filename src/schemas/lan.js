const mongoose = require("mongoose");

const LanChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  channelId: { type: String, default: null }
});

const LanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  config: { type: mongoose.Schema.Types.ObjectId, ref: "config", required: true },

  channels: [LanChannelSchema],

  startedAt: { type: Date, required: true },
  endedAt: { type: Date, default: null }

}, { timestamps: true });

module.exports = mongoose.model("lans", LanSchema);