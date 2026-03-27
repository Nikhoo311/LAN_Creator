const mongoose = require("mongoose");

const GuildSettingsSchema = new mongoose.Schema(
    {
        guildId: { type: String, required: true, unique: true },
        chosenConfigName: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("guildSettings", GuildSettingsSchema);
