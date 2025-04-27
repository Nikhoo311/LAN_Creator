const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

module.exports = {
    data: {
        name: "create-tournament-btn",
        multi: "suppr-tournament-btn"
    },
    async execute (interaction, client) {
        const bd = client.lans
        
        if (bd.size == 0) {
            return interaction.reply({ content: "❌ Je ne dispose d'aucun Tournois... Pour avoir accès à cette partie, il faut créer un Tournois et toutes les informaitons y seront afficher.", flags: [MessageFlags.Ephemeral] })
        }
    }
}