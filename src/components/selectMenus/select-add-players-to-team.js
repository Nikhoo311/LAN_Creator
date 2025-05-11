const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

let changedTeam1 = false;
let changedTeam2 = false;
module.exports = {
    data: {
        name: "select-add-players-to-team",
        multi: "select-add-players-to-team2"
    },
    async execute(interaction, client) {
        const info = interaction.values
        const teamNeedToBeChange = interaction.customId;
        async function changePlayersInEmbed(index) {
            let field = interaction.message.embeds[0].data.fields[index];
                        
            field.value = field.value.match(/> *([^*]+)/)[0].split("\n")[0]; // Récupération de nom de l'équipe
            field.value += info.map(id => `\n* <@${id}>`).join('');
            const editedEmbed = new EmbedBuilder(interaction.message.embeds[0].data)
                .spliceFields(index, 1, field)
            
            if (changedTeam1 && changedTeam2) {
                const saveTournamentBtn = new ButtonBuilder()
                    .setCustomId("save-tournament-btn")
                    .setLabel("Sauvegarder")
                    .setEmoji("💾")
                    .setStyle(ButtonStyle.Success)
                changedTeam1 = false;
                changedTeam2 = false;
                
                return await interaction.update({ embeds: [editedEmbed], components: [...interaction.message.components, new ActionRowBuilder().addComponents(saveTournamentBtn)] });
            }
            return await interaction.update({ embeds: [editedEmbed] }) 
        }

        // équipe 1
        if (teamNeedToBeChange == "select-add-players-to-team") {
            changedTeam1 = true;
            await changePlayersInEmbed(3);
        }
        // équipe 2
        else {
            changedTeam2 = true;
            await changePlayersInEmbed(4);
        }
    }
}