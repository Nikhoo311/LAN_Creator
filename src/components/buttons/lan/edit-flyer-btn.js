const { MessageFlags, ModalBuilder, FileUploadBuilder, LabelBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: {
        name: "edit-flyer-btn"
    },
    async execute (interaction, client) {
         const modal = new ModalBuilder()
            .setCustomId("lan_edit_flyer")
            .setTitle("Edition du flyer")

        const fileUploadInput = new FileUploadBuilder()
            .setCustomId("file_flyer_image")
            .setMinValues(1)
            .setMaxValues(1)
            .setRequired(true)
        
        const fileUploadLabel = new LabelBuilder()
            .setFileUploadComponent(fileUploadInput)
            .setLabel("Le nouveau flyer :")
            .setDescription("Format : png / jpeg / jpg / gif")
  
        const fileNameInputInput = new TextInputBuilder()
            .setCustomId("flyer_name")
            .setPlaceholder("Saisir le nom du nouveau flyer (optionnel).")
            .setRequired(false)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(70)
        
        const fileNameInputLabel = new LabelBuilder()
            .setTextInputComponent(fileNameInputInput)
            .setLabel("Le nom du flyer :")

        modal.addComponents(fileUploadLabel, fileNameInputLabel);
        return await interaction.showModal(modal);
    }
}