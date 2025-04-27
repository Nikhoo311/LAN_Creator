const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
module.exports = {
    data: {
        name: "create-lan-btn"
    },
    async execute (interaction, client) {
        
        const modal = new ModalBuilder()
        .setCustomId("lan_create")
        .setTitle("Création LAN")

        const textInput = new TextInputBuilder()
            .setCustomId("lan_name")
            .setLabel("Quel est le nom de LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        
        const textGoogleSheet = new TextInputBuilder()
            .setCustomId("lan_google_sheet")
            .setLabel("Quel est le Google Sheet de la LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const textNbVoc = new TextInputBuilder()
            .setCustomId("lan_nb_voc")
            .setLabel("Quel est le nombre de salons vocaux ?")
            .setRequired(false)
            .setPlaceholder("Entre 1 et 5 | Par défaut : 1")
            .setStyle(TextInputStyle.Short);

        modal.addComponents([new ActionRowBuilder().addComponents(textInput), new ActionRowBuilder().addComponents(textGoogleSheet), new ActionRowBuilder().addComponents(textNbVoc)])
        await interaction.showModal(modal)
    }
}