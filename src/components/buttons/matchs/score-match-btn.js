const { ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    data: {
        name: "score-match-btn",
    },
    async execute(interaction, client) {
        const embedStats = interaction.message.embeds[0];
        let teamsName = [];
        embedStats.data.fields.slice(1).forEach(field => {
            const lines = field.value.split('\n');
            const firstLine = lines[0].replace(/^>\s?/, '');
            teamsName.push(firstLine);
        });

        const modal = new ModalBuilder()
            .setCustomId("change-stats-match")
            .setTitle(`Statistiques du Match :`)
        
        const textScoreTeamA = new TextInputBuilder()
            .setCustomId("score_A")
            .setLabel(`Score de ${teamsName[0]}`)
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("3")

        const textScoreTeamB = new TextInputBuilder()
            .setCustomId("score_B")
            .setLabel(`Score de ${teamsName[1]}`)
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("4")

        modal.addComponents([new ActionRowBuilder().addComponents(textScoreTeamA), new ActionRowBuilder().addComponents(textScoreTeamB)])
        await interaction.showModal(modal)
    }
}