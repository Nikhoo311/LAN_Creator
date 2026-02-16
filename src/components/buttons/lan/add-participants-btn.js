const { MessageFlags } = require('discord.js');
const { Types } = require('mongoose');

module.exports = {
    data: {
        name: "add-participants-btn"
    },
    async execute (interaction, client) {
        const lanId = interaction.channel.topic
        const lan = client.lans.get(lanId);
        
    }
}