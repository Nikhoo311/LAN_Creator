const GuildSettingsModel = require("../../schemas/guildSettings");

/** @param {{ _id?: unknown } | string | null | undefined} doc */
function configId(doc) {
    if (doc == null) return "";
    if (typeof doc === "string") return doc;
    return String(doc._id);
}

function setConfigCache(client, doc) {
    client.configs.set(configId(doc), doc);
}

function removeConfigCache(client, id) {
    client.configs.delete(String(id));
}

function getGuildConfig(client, configIdStr, guildId) {
    const config = client.configs.get(String(configIdStr));
    return config && String(config.guildId) === String(guildId) ? config : null;
}

function getGuildConfigByName(client, guildId, name) {
    for (const c of client.configs.values()) {
        if (String(c.guildId) === String(guildId) && c.name === name) return c;
    }
    return null;
}

function configsForGuild(client, guildId) {
    return client.configs.filter((c) => String(c.guildId) === String(guildId)).map((c) => c);
}

function lansForGuild(client, guildId) {
    return client.lans.filter((lan) => String(lan.guildId) === String(guildId)).map((lan) => lan);
}

function getLanForGuild(client, lanId, guildId) {
    const lan = client.lans.get(String(lanId));
    return lan && String(lan.guildId) === String(guildId) ? lan : null;
}

function hasConfigNameForGuild(client, guildId, name) {
    return configsForGuild(client, guildId).some((c) => c.name === name);
}

function getChosenConfigName(client, guildId) {
    return client.guildChosenConfig.get(guildId) || "";
}

async function setChosenConfigName(client, guildId, name) {
    await GuildSettingsModel.findOneAndUpdate(
        { guildId },
        { $set: { chosenConfigName: name } },
        { upsert: true, new: true }
    );
    client.guildChosenConfig.set(guildId, name);
}

module.exports = {
    configId,
    setConfigCache,
    removeConfigCache,
    getGuildConfig,
    getGuildConfigByName,
    configsForGuild,
    lansForGuild,
    getLanForGuild,
    hasConfigNameForGuild,
    getChosenConfigName,
    setChosenConfigName,
};
