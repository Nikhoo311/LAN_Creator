const logger = require("../functions/utils/Logger");
const { serverID } = require("../../config/config.json");
const { Lan } = require("../class/Lan");
const { Tournament } = require("../class/Tournament");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {     
        try {
            const lanFile = Lan.getFile();
            lanFile.forEach(element => {
                let lan = Lan.fromJson(element)
                client.lans.set(lan.id, lan)
            });

            const tournamentFile = Tournament.getFile();
            tournamentFile.forEach(element => {
                const tournament = Tournament.fromJson(element);
                client.tournaments.set(element.id, tournament);
            })

            setInterval(() => {
                const now = Math.floor(Date.now() / 1000); // Timestamp UNIX actuel
        
                client.lans.forEach(lan => {
                    if (lan.endedAt !== null && now >= lan.endedAt) {
                        const channel = client.channels.cache.get(lan.channels.information);
        
                        if (channel) {
                            channel.send(`La LAN **${lan.name}** est terminée aujourd'hui !`);
                            // Delete voices channels
                            for (let i = 0; i < lan.channels.voice.length; i++) {
                                const element = lan.channels.voice[i];
                                client.channels.cache.get(element).delete()
                            }

                            // general channel
                            client.channels.cache.get(lan.channels.general).delete()
                            // information channel
                            client.channels.cache.get(lan.channels.information).delete()
                            // picture channel
                            client.channels.cache.get(lan.channels.picture).permissionOverwrites.edit(client.guilds.cache.get(serverID).roles.everyone, { SendMessages: false })
                            // logistique channel
                            client.channels.cache.get(lan.channels.logistique).delete()
                            
                            client.lans.delete(lan.id)
                            lan.delete()
                        } else {
                            console.error(`Channel ID ${lan.channels.information} non trouvé | ${lan.name}`);
                            
                        }
        
                    }
                });
                
            }, 60 * 100);
        } catch (error) {
            logger.error(error)
        }
        logger.clientStart(`${client.user.tag} est en ligne !`)
        
    }
}