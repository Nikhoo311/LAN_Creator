const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { readFileSync }= require("fs");

function generateSlug(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s_]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
}

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

        // Create Button
        const serveralLans = bd.size > 1;
        const currentLan = !serveralLans ? bd.first() : bd;
        const possibleGamesChoices = JSON.parse(readFileSync(`./config/bd.json`, "utf-8"))["tournamentGames"];
        
        let message = "# Création de Tournois";
        if (serveralLans) {
            message += `\nMerci de choisir la LAN sur laquelle se déroulera le tournoi`
            let selectLanForTournament = new StringSelectMenuBuilder()
                .setCustomId('select-lan-for-tournament')
                .setMinValues(1)
                .setMaxValues(1)
                .setPlaceholder("Choisir une LAN")
            
            bd.forEach(lan => {
                selectLanForTournament.addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setLabel(lan.name)
                    .setValue(lan.id)
                )
            });
            return interaction.reply({ content: message, components: [new ActionRowBuilder().addComponents(selectLanForTournament)], flags: MessageFlags.Ephemeral })
        }

        if (interaction.customId == "create-tournament-btn") {         
            
            message += ` pour \`\`${currentLan.name}\`\`\nCet espace est dédié à la création de Tournois Multi-jeux !\n# Informations :\nIl vous suffit de choisir le jeu sur lequel le tournoi sera organisé !\n`
            let selectGame = new StringSelectMenuBuilder()
                .setCustomId("select-game-tournament")
                .setMinValues(1)
                .setMaxValues(1)
                .setPlaceholder("Choisir un jeu")
            
            possibleGamesChoices.forEach(game => {
                selectGame.addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setEmoji(game?.emoji)
                    .setLabel(game.name)
                    .setValue(generateSlug(game.name))
                )
            });
            return interaction.reply({ content: message, components: [new ActionRowBuilder().addComponents(selectGame)]})
        }
    }
}