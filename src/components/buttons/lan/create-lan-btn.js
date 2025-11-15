const { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } = require("discord.js");
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
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        
        const textInputLabel = new LabelBuilder()
            .setTextInputComponent(textInput)
            .setLabel("Quel est le nom de LAN ?")

        const textGoogleSheet = new TextInputBuilder()
            .setCustomId("lan_google_sheet")
            .setRequired(false)
            .setStyle(TextInputStyle.Short);

        const textGoogleSheetLabel = new LabelBuilder()
            .setTextInputComponent(textGoogleSheet)
            .setLabel("Quel est le Google Sheet de la LAN ?")
        
        const textNbVoc = new TextInputBuilder()
            .setCustomId("lan_nb_voc")
            .setRequired(false)
            .setPlaceholder("Entre 1 et 5 | Par défaut : 1")
            .setStyle(TextInputStyle.Short);

        const textNbVocLabel = new LabelBuilder()   
            .setTextInputComponent(textNbVoc)
            .setLabel("Quel est le nombre de salons vocaux ?")

        modal.addLabelComponents(textInputLabel, textGoogleSheetLabel, textNbVocLabel)
        return await interaction.showModal(modal)
    }
}