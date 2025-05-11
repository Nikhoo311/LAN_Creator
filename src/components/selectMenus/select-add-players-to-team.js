const { MessageFlags, EmbedBuilder } = require("discord.js");
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
            
            await interaction.update({ embeds: [editedEmbed] }) 
        }
        // équipe 1
        if (teamNeedToBeChange == "select-add-players-to-team") {
            await changePlayersInEmbed(3);
        }
        // équipe 2
        else {
            await changePlayersInEmbed(4)
        }
    }
}