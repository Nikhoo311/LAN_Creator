const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { readFileSync } = require('fs');
module.exports = {
    data: {
        name: "manangement-tournament-btn"
    },
    async execute (interaction, client) {
        // const message = `# Espace d'archivage des LANs : \`${tournament[0]}\`\nCeci est un espace qui permet d'archiver une lan facilement en un clic ! La LAN \`${lanName}\` se clotura dans les 48h qui suit la demande d'archivage.\n\n## Informations\nPour archiver une LAN, il suffit de cliquer sur le bouton \`\`Oui\`\`. Une fois la demande d'archivage fait et le délai dépasser, tous les membres ne pourront plus parler dans les salons textuels et les salons vocaux seront supprimés.\n\n\`\`\`\nEs-tu sûr de bien vouloir archiver ${lanName} ?\`\`\``
        const { tournaments } = client;
        if (tournaments.size == 0) {
            return interaction.reply({ content: "❌ Je ne dispose d'aucun Tournois... Pour avoir accès à cette partie, il faut créer un Tournois et toutes les informaitons y seront afficher.", flags: [MessageFlags.Ephemeral] })
        }
        
        const statsBtn = new ButtonBuilder()
            .setCustomId("stats-tournament-btn")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Statistiques")
            .setEmoji("📊")
        
        const matchBtn = new ButtonBuilder()
            .setCustomId("match-btn")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Créer un Match")
            .setEmoji("🎮")    
        interaction.reply({ content: "message", components: [new ActionRowBuilder().addComponents(matchBtn).addComponents(statsBtn)], flags: [MessageFlags.Ephemeral] });
    }
}