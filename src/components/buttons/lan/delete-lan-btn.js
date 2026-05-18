const { MessageFlags } = require('discord.js');
const { Lan } = require('../../../class/Lan');
const { getLanForGuild } = require("../../../functions/utils/guildCache");
const logger = require("../../../functions/utils/Logger");

module.exports = {
    data: {
        name: "delete-lan-btn"
    },
    async execute (interaction, client) {
        const generalChannel = interaction.guild.channels.cache.get(interaction.channelId)?.parent
        const lanId = generalChannel?.topic;

        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }
        
        try {
            const channels = lan.channels.map(obj => interaction.guild.channels.cache.get(obj.channelId)).filter(c => c);
            channels.push(generalChannel.parent);
            for await (const channel of channels) {
                await channel.delete();
            }
            await Lan.deleteById(lan.id);
            client.lans.delete(lan.id);

            // await interaction.user.send({ content: `✅ La LAN **${lan.name}** a été supprimée avec succès. Tous les salons associés ont été supprimés également.` });
            return;
            
        } catch (error) {
            logger.error("Erreur lors de la suppression de la LAN :", error);
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur est survenue lors de la suppression de la LAN. Veuillez réessayer plus tard.", flags: [MessageFlags.Ephemeral] });
            return;
        }
    }
}