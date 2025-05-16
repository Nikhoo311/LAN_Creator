const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { readFileSync } = require('fs');
module.exports = {
    data: {
        name: "manangement-tournament-btn"
    },
    async execute (interaction, client) {
        const tournament = JSON.parse(readFileSync('config/tournament.json', "utf-8"));
        // const message = `# Espace d'archivage des LANs : \`${tournament[0]}\`\nCeci est un espace qui permet d'archiver une lan facilement en un clic ! La LAN \`${lanName}\` se clotura dans les 48h qui suit la demande d'archivage.\n\n## Informations\nPour archiver une LAN, il suffit de cliquer sur le bouton \`\`Oui\`\`. Une fois la demande d'archivage fait et le délai dépasser, tous les membres ne pourront plus parler dans les salons textuels et les salons vocaux seront supprimés.\n\n\`\`\`\nEs-tu sûr de bien vouloir archiver ${lanName} ?\`\`\``
        console.log(tournament);
        
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