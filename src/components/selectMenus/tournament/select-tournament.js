const { ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require("discord.js");
const { color } = require("../../../../config/config.json");
const { readFileSync } = require("fs");

const { generateSlug } = require('../../../functions/utils/generateSlug');

module.exports = {
    data: {
        name: "select-tournament",
        multi: "select-suppr-tournament"
    },
    async execute(interaction, client) {
        const info = interaction.values[0];
        const { tournaments } = client;
        const tournament = tournaments.get(info);

        const gamePossible = JSON.parse(readFileSync('./config/bd.json', 'utf-8'))["tournamentGames"];
        const gameChosen = gamePossible.filter(game => generateSlug(tournament.game) == generateSlug(game.name))[0];
        
        if (!gameChosen) {
            return interaction.reply({ content: "❌ Aucun jeu n'a été trouver... Recommencez"})
        }
        
        const embedStats = new EmbedBuilder()
            .setColor(color.green)
            .setDescription(`# Score : ${tournament.scoreA} - ${tournament.scoreB}`)
            .addFields(
                { name: "**Jeu**", value: `> ${gameChosen.emoji} ${gameChosen.name}`, inline: true },
                { name: "**Nombre de match(s)**", value: `> ${tournament.matches.length}`, inline: false },
            )
            .setFooter({ text: `ID : ${tournament.id}` })
        let i = 0;
        const guild = interaction.guild;
        
        let alreadyTeamsChannels = false;
        tournament.teams.forEach(team => {
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

        let message = "# Espace de ";
        if (interaction.customId == "select-suppr-tournament") {
            message += `suppression du tournois \`\`${tournament.name}\`\`\n-# ID: \`\`${tournament.id}\`\`\n## Informations :\n* Pour supprimer ce Tounois il suffit de cliquer sur le bouton \`\`Oui\`\`.\n* Pour annuler la demande de supression de ce Tounois il suffit de cliquer sur le bouton \`\`Non\`\`.\n\n\`\`\`\n\n Es-tu sûr de bien vouloir supprimer ${tournament.name} ?\n\`\`\``;
            const supprYesTournament = new ButtonBuilder()
                .setCustomId("suppr-tournament-yes-btn")
                .setEmoji('✅')
                .setLabel("Oui")
                .setStyle(ButtonStyle.Success)
            
            const supprNoTournament = new ButtonBuilder()
                .setCustomId("suppr-tournament-no-btn")
                .setEmoji('✖️')
                .setLabel("Non")
                .setStyle(ButtonStyle.Danger)
                
            interaction.update({ content: message, embeds:[embedStats], components: [new ActionRowBuilder().addComponents([supprYesTournament, supprNoTournament])] });

        } else {
            message += `gestion de Tournois pour \`\`${tournament.name}\`\`\nCet espace est dédié à la gestion du Tournois !\n## Informations :\n* Pour **créer** un match et l'ajouter au tournois *${tournament.name}*, il suffit de cliquer sur le bouton \`Créer un Match\` et suivre les instructions.\n* Pour **gérer** un match parmis la liste des matches du tournois, il faut cliquer le bouton \`Gestions des Matchs\`.\n* Pour **supprimer** un match du tournois *${tournament.name}*, il suffit de cliquer le bouton \`Supprimer un Match\`. Le processus est **irréverssible**.\n* Pour créer des salons vocaux dédiés à chaque équipe, accessibles uniquement par les membres de leur équipe respective, il faut cliquer sur le bouton \`Créer les salons vocaux d'équipes\`.\n* Pour **supprimer** les salons vocaux d'équipes, le bouton \`Supprimer les salons vocaux d'équipes\` est disponible, cette action est **irréverssible**.`;
    
            const matchBtn = new ButtonBuilder()
                .setCustomId("create-match-btn")
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
            interaction.update({ content: message, embeds: [embedStats], components: [new ActionRowBuilder().addComponents(matchBtn).addComponents(managementMatchBtn).addComponents(supprMatchBtn), new ActionRowBuilder().addComponents(teamChannelsBtn)] });
        }
    }
}