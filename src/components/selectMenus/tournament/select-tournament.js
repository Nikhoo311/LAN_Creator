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
        let i = 0;
        const guild = interaction.guild;
        tournament.teams.forEach(team => {
            let teamDisplay = "";
            team.players.forEach(player => {
                teamDisplay += `- <@${guild.members.cache.find(m => player.name == m.displayName).user.id}>\n`

            })
            embedStats.addFields({
                name: `${i >= 1 ? "\u200B" : "**Équipes**"}`, value: `> ${team.name}\n${teamDisplay}`, inline: true
            })
            i++;
        })

        let message = "# Espace de ";
        if (interaction.customId == "select-suppr-tournament") {
            message += `suppression du tournois \`\`${tournament.name}\`\`\n-# ID: \`\`${tournament.id}\`\`\n ## Informations :\n Pour supprimer ce Tounois il suffit de cliquer sur le bouton \`\`Oui\`\`.\n\n\`\`\`\n\n Es-tu sûr de bien vouloir supprimer ${tournament.name} ?\n\`\`\``;
            const supprYesTournament = new ButtonBuilder()
                .setCustomId("suppr-yes-btn")
                .setEmoji('✅')
                .setLabel("Oui")
                .setStyle(ButtonStyle.Success)
            
            const supprNoTournament = new ButtonBuilder()
                .setCustomId("suppr-no-btn")
                .setEmoji('✖️')
                .setLabel("Non")
                .setStyle(ButtonStyle.Danger)
                
            interaction.update({ content: message, embeds:[embedStats], components: [new ActionRowBuilder().addComponents([supprYesTournament, supprNoTournament])] });

        } else {
            message += `gestion de Tournois pour \`\`${tournament.name}\`\`\nCet espace est dédié à la gestion du Tournois !\n## Informations :\n`;
    
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
            
            interaction.update({ content: message, embeds: [embedStats], components: [new ActionRowBuilder().addComponents(matchBtn).addComponents(managementMatchBtn).addComponents(supprMatchBtn), new ActionRowBuilder().addComponents(createVocalsChannelsBtn)] });
        }
    }
}