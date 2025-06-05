const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require("discord.js");
const { color } = require('../../../../config/config.json');
const { readFileSync } = require('fs');
const { generateSlug } = require('../../../functions/utils/generateSlug');

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
            message += ` pour \`\`${currentTournament.name}\`\`\nCet espace est dédié à la gestion du Tournois !\n# Informations :\n* Pour **créer** un match et l'ajouter au tournois *${currentTournament.name}*, il suffit de cliquer sur le bouton \`Créer un Match\` et suivre les instructions.\n* Pour **gérer** un match parmis la liste des matches du tournois, il faut cliquer le bouton \`Gestions des Matchs\`.\n* Pour **supprimer** un match du tournois *${currentTournament.name}*, il suffit de cliquer le bouton \`Supprimer un Match\`. Le processus est **irréverssible**.\n* Pour créer des salons vocaux dédiés à chaque équipe, accessibles uniquement par les membres de leur équipe respective, il faut cliquer sur le bouton \`Créer les salons vocaux d'équipes\`.\n* Pour **supprimer** les salons vocaux d'équipes, le bouton \`Supprimer les salons vocaux d'équipes\` est disponible, cette action est **irréverssible**.`;
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
                .setFooter({ text: `ID : ${currentTournament.id}` })
            let i = 0;
            const guild = interaction.guild;
            let alreadyTeamsChannels = false;
            currentTournament.teams.forEach(team => {
                let teamDisplay = "";
                team.players.forEach(player => {
                    teamDisplay += `- <@${guild.members.cache.find(m => player.name == m.displayName).user.id}>\n`

                })
                embedStats.addFields({
                    name: `${i >= 1 ? "\u200B" : "**Équipes**"}`, value: `> ${team.name}\n${teamDisplay}`, inline: true
                })
                i++;
                alreadyTeamsChannels = team.voiceChannel ? true : false;
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
                .setEmoji('<:trash:1378419101751447582>')
            
            const createVocalsChannelsBtn = new ButtonBuilder()
                .setCustomId("create-voices-channels-btn")
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Créer les salons vocaux d'équipes")
                .setEmoji('<:voice_add:1379566685681618975>')
            
            const supprTeamsVoiceChannels = new ButtonBuilder()
                .setCustomId("suppr-teams-voice-channels")
                .setLabel("Supprimer les salons vocaux d'équipes")
                .setEmoji("<:voice_remove:1379573487655587921>")
                .setStyle(ButtonStyle.Danger)
            const teamChannelsBtn = alreadyTeamsChannels ? supprTeamsVoiceChannels : createVocalsChannelsBtn;
            interaction.reply({ content: message, embeds: [embedStats], components: [new ActionRowBuilder().addComponents(matchBtn).addComponents(managementMatchBtn).addComponents(supprMatchBtn), new ActionRowBuilder().addComponents(teamChannelsBtn)] });
        }
    }
}