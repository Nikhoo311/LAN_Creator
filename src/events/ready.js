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
            
            // setInterval(() => {
            //     const now = Math.floor(Date.now() / 1000);
                
            //     client.lans.forEach(async (lan) => {
            //         if (lan.endedAt !== null && now >= lan.endedAt) {
            //             // Delete voices channels
            //             for (let i = 0; i < lan.channels.voice.length; i++) {
            //                 const element = lan.channels.voice[i];
            //                 client.channels.cache.get(element).delete()
            //             }
                        
            //             // general channel
            //             client.channels.cache.get(lan.channels.general).delete()
            //             // information channel
            //             client.channels.cache.get(lan.channels.information).delete()
            //             // picture channel
            //             client.channels.cache.get(lan.channels.picture).permissionOverwrites.edit(client.guilds.cache.get(serverID).roles.everyone, { SendMessages: false })
            //             // logistique channel
            //             client.channels.cache.get(lan.channels.logistique).delete()
                        
            //             client.lans.delete(lan.id)
            //             await LanModel.findByIdAndDelete(lan.id);
        
            //         }
            //     });
                
            // }, 60 * 100);
        } catch (error) {
            logger.error(error)
        }
        logger.clientStart(`${client.user.tag} est en ligne !`)
        
    }
}