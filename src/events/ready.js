const logger = require("../functions/utils/Logger");
const { Lan } = require("../class/Lan");
const LanModel = require("../schemas/lan");
const ConfigModel = require("../schemas/config");
const GuildSettingsModel = require("../schemas/guildSettings");
const { configId } = require("../functions/utils/guildCache");

module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        try {
            const lans = await LanModel.find().populate("config");

            for (const lan of lans) {
                if (!lan.guildId) continue;
                const startedSec =
                    lan.startedAt instanceof Date
                        ? Math.floor(lan.startedAt.getTime() / 1000)
                        : Math.floor(Number(lan.startedAt) / 1000);
                const endedSec =
                    lan.endedAt != null
                        ? lan.endedAt instanceof Date
                            ? Math.floor(lan.endedAt.getTime() / 1000)
                            : Math.floor(Number(lan.endedAt) / 1000)
                        : null;
                client.lans.set(
                    lan._id.toString(),
                    new Lan(lan.name, lan.channels, lan.config, lan.participants, lan._id.toString(), startedSec, endedSec, lan.guildId)
                );
            }

            const configs = await ConfigModel.find();
            for (const config of configs) {
                if (!config.guildId) continue;
                client.configs.set(configId(config), config);
            }

            const guildSettings = await GuildSettingsModel.find();
            for (const gs of guildSettings) {
                client.guildChosenConfig.set(gs.guildId, gs.chosenConfigName || "");
            }

            setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                
                client.lans.forEach(async (lan) => {
                    if (lan.endedAt && now >= lan.endedAt) {
                        const channels = lan.channels;
                        const vocalChannels = channels.filter((ch) => ch.name.toLowerCase().includes("vocal"));
                        const textChannels = channels.filter(
                            (ch) => ch.name.toLowerCase() !== "photos" && !vocalChannels.includes(ch)
                        );

                        for (const element of vocalChannels) {
                            const ch = client.channels.cache.get(element.channelId);
                            await ch?.delete().catch(() => {});
                        }

                        for (const ch of textChannels) {
                            const discordCh = client.channels.cache.get(ch.channelId);
                            await discordCh?.delete().catch(() => {});
                        }

                        const photos = channels.find((ch) => ch.name.toLowerCase() == "photos");
                        if (photos?.channelId) {
                            const photosCh = client.channels.cache.get(photos.channelId);
                            await photosCh.permissionOverwrites.edit(photosCh.guild.roles.everyone, { SendMessages: false }).catch(() => {});
                        }

                        client.lans.delete(lan.id)
                        await LanModel.findByIdAndDelete(lan.id);
                    }
                });
            }, 60 * 100);
        } catch (error) {
            logger.error(error)
        }
        logger.clientStart(`${client.user.tag} est en ligne !`)
        
    }
}