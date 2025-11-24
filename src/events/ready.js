const logger = require("../functions/utils/Logger");
const { serverID } = require("../../config/config.json");
const { Lan } = require("../class/Lan");
const { Tournament } = require("../class/Tournament");
const LanModel = require("../schemas/lan");
const ConfigModel = require("../schemas/config");

module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {     
        try {
            const lans = await LanModel.find();

            lans.map(lan => client.lans.set(lan._id, new Lan(lan.name, lan.channels, lan.config, Math.floor(lan.startedAt / 1000), Math.floor(lan.endedAt / 1000), lan._id)))
            
            const configs = await ConfigModel.find();
            configs.map(config => client.configs.set(config.name, config))

            const tournamentFile = Tournament.getFile();
            tournamentFile.forEach(element => {
                const tournament = Tournament.fromJson(element);
                client.tournaments.set(element.id, tournament);
            })

            setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                
                client.lans.forEach(async (lan) => {
                    if (lan.endedAt !== null && now >= lan.endedAt) {
                        const channels = lan.channels;
                        const vocalChannels = channels.filter(ch => ch.name.toLowerCase().includes("vocal"))
                        const textChannels = channels.filter(ch => ch.name.toLowerCase() !== "photos" && !vocalChannels.includes(ch));
                        
                        // Delete voices channels
                        for (let i = 0; i < vocalChannels.length; i++) {
                            const element = vocalChannels[i];
                            client.channels.cache.get(element.channelId).delete()
                        }

                        textChannels.forEach(ch => {
                            client.channels.cache.get(ch.channelId).delete()
                        })
                        client.channels.cache.get(channels.find(ch => ch.name.toLowerCase() == "photos").channelId).permissionOverwrites.edit(client.guilds.cache.get(serverID).roles.everyone, { SendMessages: false })

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