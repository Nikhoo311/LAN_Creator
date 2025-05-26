const { readFileSync } = require("fs");
const { MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { color } = require("../../../../config/config.json");

function generateSlug(str) {
    return str
      .normalize("NFD")                      // Décompose les accents
      .replace(/[\u0300-\u036f]/g, "")       // Supprime les diacritiques
      .replace(/[^a-zA-Z0-9\s_]/g, "")       // Supprime les caractères spéciaux (mais garde underscore)
      .trim()                                // Enlève les espaces inutiles
      .replace(/\s+/g, "_")                  // Remplace les espaces par des underscores
      .replace(/_+/g, "_")                   // Supprime les doubles underscores
      .toLowerCase();
}

module.exports = {
    data: {
        name: "select-game-tournament"
    },
    async execute(interaction, client) {
        const info = interaction.values[0]
    
        const gamePossible = JSON.parse(readFileSync('./config/bd.json', 'utf-8'))["tournamentGames"];
        const gameChosen = gamePossible.filter(game => info == generateSlug(game.name))[0];
        
        if (!gameChosen) {
            return interaction.reply({ content: "❌ Aucun jeu n'a été trouver... Recommencez"})
        }

        const lanName = interaction.message.content.split(`\`\``)[1];
        let message = `# Création de Tournois pour \`\`${lanName}\`\`\nCet espace est dédié à la création de Tournois Multi-jeux !\n# Informations :\n* Tu as juste a remplir tous les informations nécessaires pour le tournois. Les informations sont **modifiable a tout moment**\n* Pour **sauvegarder** un tournois et le créer, tu peux cliquer sur le bouton \`Sauvegarder\`.`;
        let isDisabled = true;
        if (!interaction.message.embeds[0]) {
            infoCreateEmbed = new EmbedBuilder()
                .setColor(color.green)
                .addFields(
                    { name: "**Nom du tournois**", value: '*Non défini*', inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: "**Jeu**", value: `> ${gameChosen.emoji} ${gameChosen.name}`, inline: true },
                    { name: "**Équipes**", value: '*Aucune équipe(s) enregistrée(s)*', inline: true },
                )
        } else {
            infoCreateEmbed = new EmbedBuilder(interaction.message.embeds[0])
                .spliceFields(2, 1, {
                    name: "**Jeu**", value: `> ${gameChosen.emoji} ${gameChosen.name}`, inline: true
                })            
            isDisabled = interaction.message.embeds[0].fields[0].value != "*Non défini*" ? !isDisabled : isDisabled;
        }
        
        const updateTournamentNameBtn = new ButtonBuilder()
            .setCustomId("set-tournament-name-btn")
            .setLabel("Modifier le nom")
            .setEmoji("✏️")
            .setStyle(ButtonStyle.Secondary)
        
        const addTeamsTournamentBtn = new ButtonBuilder()
            .setCustomId("add-teams-tournament-btn")
            .setLabel("Paramètres d'équipes")
            .setEmoji("👥")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(isDisabled)
        
        return interaction.update({ 
            content: message, 
            embeds: [infoCreateEmbed],
            components: [new ActionRowBuilder().addComponents(interaction.component), new ActionRowBuilder().addComponents(updateTournamentNameBtn).addComponents(addTeamsTournamentBtn)]
        })
    }
}