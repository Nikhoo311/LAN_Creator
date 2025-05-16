const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const tournament = require("../../commands/lan/tournament");
module.exports = {
    data: {
        name: "manangement-tournament-btn"
    },
    async execute (interaction, client) {
        const { tournaments } = client;
        if (tournaments.size == 0) {
            return interaction.reply({ content: "❌ Je ne dispose d'aucun Tournois... Pour avoir accès à cette partie, il faut créer un Tournois et toutes les informaitons y seront afficher.", flags: [MessageFlags.Ephemeral] })
        }
        const serveralTournaments = tournaments.size > 1;
        const currentTournament = !serveralTournaments ? tournaments.first() : tournaments;

        let message = `# Espace de gestion de Tournois`;
        if (serveralTournaments) {
            message += "\nMerci de choisir le Tournois qui a besoin d'être gérer";
            let selectTournament = new StringSelectMenuBuilder()
                            .setCustomId("select-tournament")
                            .setMinValues(1)
                            .setMaxValues(1)
                            .setPlaceholder("Choisir un Tournois")
                        
            tournaments.forEach(tournament => {
                selectTournament.addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setEmoji("🎮")
                    .setLabel(tournament.name)
                    .setValue(tournament.id)
                )
            });
            return interaction.reply({ content: message, components: [new ActionRowBuilder().addComponents(selectTournament)]})
        } else {
            message += ` pour \`\`${currentTournament.name}\`\`\nCet espace est dédié à la gestion du Tournois !\n# Informations :\n`;
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
            interaction.reply({ content: message, components: [new ActionRowBuilder().addComponents(matchBtn).addComponents(statsBtn)], flags: [MessageFlags.Ephemeral] });
        }
    }
}