const { MessageFlags, ContainerBuilder } = require('discord.js');
const { Lan } = require('../../../class/Lan');
const { getLanForGuild } = require("../../../functions/utils/guildCache");
const logger = require("../../../functions/utils/Logger");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "lan-management-btn"
    },
    async execute (interaction, client) {
        const generalChannel = interaction.guild.channels.cache.get(interaction.channelId)?.parent
        const lanId = generalChannel?.topic;

        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const container = new ContainerBuilder()
            
    }
}