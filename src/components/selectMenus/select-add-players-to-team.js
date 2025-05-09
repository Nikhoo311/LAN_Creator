const { MessageFlags, EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "select-add-players-to-team",
        multi: "select-add-players-to-team2"
    },
    async execute(interaction, client) {
        const info = interaction.values
        const teamNeedToBeChange = interaction.customId;

        // équipe 1
        if (teamNeedToBeChange == "select-add-players-to-team") {
            let field = interaction.message.embeds[0].data.fields[3];
            
            field.value = field.value.match(/> *([^*]+)/)[0].split("\n")[0]; // Récupération de nom de l'équipe
            field.value += info.map(id => `\n* <@${id}>`).join('');
            const editedEmbed = new EmbedBuilder(interaction.message.embeds[0].data)
                .spliceFields(3, 1, field)
            
            await interaction.update({ embeds: [editedEmbed] })
        }
        // équipe 2
        else {
            let field = interaction.message.embeds[0].data.fields[4];
            
            field.value = field.value.match(/> *([^*]+)/)[0].split("\n")[0]; // Récupération de nom de l'équipe
            field.value += info.map(id => `\n* <@${id}>`).join('');
            const editedEmbed = new EmbedBuilder(interaction.message.embeds[0].data)
                .spliceFields(4, 1, field)
            
            await interaction.update({ embeds: [editedEmbed] })
        }
    }
}