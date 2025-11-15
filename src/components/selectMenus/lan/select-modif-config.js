const { TextInputBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder, LabelBuilder } = require("discord.js");
const { color } = require("../../../../config/config.json");
const Config = require('../../../schemas/config');
const { decrypt } = require("../../../functions/utils/crypt");

module.exports = {
    data: {
        name: "select-modif-config"
    },
    async execute(interaction, client) {
        const info = interaction.values[0]

        const config = client.configs.get(info);
        
        const modal = new ModalBuilder()
            .setCustomId("modif-config")
            .setTitle(`Modification de ${config.name}`)

        const textInput = new TextInputBuilder()
            .setCustomId("config_name")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(config.name)
            .setPlaceholder(config.name)

        const textInputLabel = new LabelBuilder()
            .setTextInputComponent(textInput)
            .setLabel("Quel est le nom de la configuration de LAN ?")

        const textAddress = new TextInputBuilder()
            .setCustomId("config_address")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("999 rue des champignons braisé - 05125 La Forêt")
            .setValue(decrypt(config.address, process.env.TOKEN))

        const textAddressLabel = new LabelBuilder()
            .setTextInputComponent(textAddress)
            .setLabel("Quelle est l'addresse de la LAN ?")

        const textHours = new TextInputBuilder()
            .setCustomId("config_hours")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("19h00")
            .setValue(config.hours)

        const textHoursLabel = new LabelBuilder()
            .setTextInputComponent(textHours)
            .setLabel("Quelle est l'heure d'arrivé de la LAN ?")

        const textMaterial = new TextInputBuilder()
            .setCustomId("config_material")
            .setRequired(false)
            .setPlaceholder("Par défaut : Aucun")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500)
            .setValue(config.materials !== "Aucun" ? config.materials : "Aucun");

        const textMaterialLabel = new LabelBuilder()
            .setTextInputComponent(textMaterial)
            .setLabel("Quel est le matériel disponible pour la LAN ?")

        modal.addLabelComponents(textInputLabel, textAddressLabel, textHoursLabel, textMaterialLabel)
        
        client.placeholder.set(interaction.applicationId, textInput.data.placeholder)
        return await interaction.showModal(modal)
    }
}