const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { color } = require("../../../../config/config.json");
const { readFileSync } = require("fs");
const { generateSlug } = require("../../../functions/utils/generateSlug");
module.exports = {
    data: {
        name: "suppr-tournament-btn"
    },
    async execute(interaction, client) {
        const { tournaments } = client;
        if (tournaments.size == 0) {
            return interaction.reply({ content: "❌ Je ne dispose d'aucun Tournois... Pour avoir accès à cette partie, il faut créer un Tournois et toutes les informaitons y seront afficher.", flags: [MessageFlags.Ephemeral] })
        }
        const serveralTournaments = tournaments.size > 1;
        const currentTournament = !serveralTournaments ? tournaments.first() : tournaments;

        let message = `# Espace de suppression de Tournois`;
        if (serveralTournaments) {
            message += "\nMerci de choisir le Tournois qui a besoin d'être supprimer";
            let selectTournament = new StringSelectMenuBuilder()
                .setCustomId("select-suppr-tournament")
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
            return interaction.reply({ content: message, components: [new ActionRowBuilder().addComponents(selectTournament)], flags: [MessageFlags.Ephemeral] })
        } else {
            message += `suppression du tournois \`\`${currentTournament.name}\`\`\n-# ID: \`\`${currentTournament.id}\`\`\n## Informations :\n*Pour supprimer ce Tounois il suffit de cliquer sur le bouton \`\`Oui\`\`.\n\n\`\`\`\n\n Es-tu sûr de bien vouloir supprimer ${currentTournament.name} ?\n\`\`\``;

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
                
            interaction.reply({ content: message, embeds:[embedStats], components: [new ActionRowBuilder().addComponents([supprYesTournament, supprNoTournament])], flags: [MessageFlags.Ephemeral] });
        }
    }
}