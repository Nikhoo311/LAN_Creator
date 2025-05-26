const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require("discord.js");
const { color } = require('../../../../config/config.json');
const { readFileSync } = require('fs');
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
            const gamePossible = JSON.parse(readFileSync('./config/bd.json', 'utf-8'))["tournamentGames"];
            const gameChosen = gamePossible.filter(game => generateSlug(currentTournament.game) == generateSlug(game.name))[0];
            
            if (!gameChosen) {
                return interaction.reply({ content: "❌ Aucun jeu n'a été trouver... Recommencez"})
            }
            
            const embedStats = new EmbedBuilder()
                .setColor(color.green)
                .setDescription(`# Score : ${currentTournament.scoreA} - ${currentTournament.scoreB}`)
                .addFields(
                    { name: "**Jeu**", value: `> ${gameChosen.emoji} ${gameChosen.name}`, inline: true },
                    { name: "**Nombre de match(s)**", value: `> ${currentTournament.matches.length}`, inline: false },
                )
            let i = 0;
            const guild = interaction.guild;
            currentTournament.teams.forEach(team => {
                let teamDisplay = "";
                team.players.forEach(player => {
                    teamDisplay += `- <@${guild.members.cache.find(m => player.name == m.displayName).user.id}>\n`

                })
                embedStats.addFields({
                    name: `${i >= 1 ? "\u200B" : "**Équipes**"}`, value: `> ${team.name}\n${teamDisplay}`, inline: true
                })
                i++;
            })

            const matchBtn = new ButtonBuilder()
                .setCustomId("match-btn")
                .setStyle(ButtonStyle.Primary)
                .setLabel("Créer un Match")
                .setEmoji("🎮")
            
            const managementMatchBtn = new ButtonBuilder()
                .setCustomId("management-match-btn")
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Gestion des Matchs")
                .setEmoji("⚙️")
            
            const supprMatchBtn = new ButtonBuilder()
                .setCustomId("suppr-match-btn")
                .setStyle(ButtonStyle.Danger)
                .setLabel("Supprimer un Match")
                .setEmoji('✖️')
            
            const createVocalsChannelsBtn = new ButtonBuilder()
                .setCustomId("create-vocals-channels-btn")
                .setStyle(ButtonStyle.Success)
                .setLabel("Créer les salons vocaux d'équipes")
                .setEmoji('🔊')
            
            interaction.reply({ content: message, embeds: [embedStats], components: [new ActionRowBuilder().addComponents(matchBtn).addComponents(managementMatchBtn).addComponents(supprMatchBtn), new ActionRowBuilder().addComponents(createVocalsChannelsBtn)] });
        }
    }
}