const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } = require("discord.js");
module.exports = {
    data: {
        name: "creation-config-btn"
    },
    async execute (interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId("creation-config")
            .setTitle("Création d'une nouvelle configuration de LAN")

        const textInput = new TextInputBuilder()
            .setCustomId("config_name")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const textInputLabel = new LabelBuilder()
            .setTextInputComponent(textInput)
            .setLabel("Quel est le nom de la configuration de LAN ?")

        const textaddress = new TextInputBuilder()
            .setCustomId("config_address")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("999 rue des champignons braisé - 05125 La Forêt")

        const textAddressLabel = new LabelBuilder()
            .setTextInputComponent(textaddress)
            .setLabel("Quelle est l'addresse de la LAN ?")

        const textHours = new TextInputBuilder()
            .setCustomId("config_hours")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("19h00")
    
        const textHoursLabel = new LabelBuilder()
            .setTextInputComponent(textHours)
            .setLabel("Quelle est l'heure d'arrivé de la LAN ?")

        const textMaterial = new TextInputBuilder()
            .setCustomId("config_material")
            .setRequired(false)
            .setPlaceholder("Par défaut : Aucun")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500);
            
        const textMaterialLabel = new LabelBuilder()
            .setLabel("Quel est le matériel disponible pour la LAN ?")
            .setTextInputComponent(textMaterial)
        modal.addLabelComponents(textInputLabel, textAddressLabel, textHoursLabel, textMaterialLabel)
        return await interaction.showModal(modal)
    }
}