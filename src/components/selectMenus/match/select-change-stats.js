const { ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    data: {
        name: "select-change-stats1",
        multi: "select-change-stats2"
    },
    async execute(interaction, client) {
        const info = interaction.values[0].split(";");
        const [playerName, teamId] = info;
        
        const modal = new ModalBuilder()
            .setCustomId("change-stats-match")
            .setTitle(`Statistiques : [${teamId}] ${playerName}`)
        
        const textKills = new TextInputBuilder()
            .setCustomId("num_kills")
            .setLabel("Nombre de kills")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("3")

        const textDeaths = new TextInputBuilder()
            .setCustomId("num_deaths")
            .setLabel("Nombre de morts")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("4")
        
        client.placeholder.set(interaction.applicationId, playerName);
        modal.addComponents([new ActionRowBuilder().addComponents(textKills), new ActionRowBuilder().addComponents(textDeaths)])
        await interaction.showModal(modal)
    }
}