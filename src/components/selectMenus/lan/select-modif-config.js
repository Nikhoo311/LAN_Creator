const { TextInputBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder } = require("discord.js");
const { color } = require("../../../../config/config.json");
const Config = require('../../../schemas/config');
const { decrypt } = require("../../../functions/utils/crypt");

module.exports = {
    data: {
        name: "select-modif-config"
    },
    async execute(interaction, client) {
        const info = interaction.values[0]

        const config = await Config.findOne({name: info});
        
        const modal = new ModalBuilder()
            .setCustomId("modif-config")
            .setTitle(`Modification de ${config.name}`)

        const textInput = new TextInputBuilder()
            .setCustomId("config_name")
            .setLabel("Quel est le nom de la configuration de LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setValue(config.name)
            .setPlaceholder(config.name)
        
        const textaddress = new TextInputBuilder()
            .setCustomId("config_address")
            .setLabel("Quelle est l'addresse de la LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("999 rue des champignons braisé - 05125 La Forêt")
            .setValue(decrypt(config.address, process.env.TOKEN))

        const textHours = new TextInputBuilder()
            .setCustomId("config_hours")
            .setLabel("Quelle est l'heure d'arrivé de la LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("19h00")
            .setValue(config.hours)

        const textMaterial = new TextInputBuilder()
            .setCustomId("config_material")
            .setLabel("Quel est le matériel disponible pour la LAN ?")
            .setRequired(false)
            .setPlaceholder("Par défaut : Aucun")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500)
            .setValue(config.materials !== "Aucun" ? config.materials : "Aucun");

        modal.addComponents([new ActionRowBuilder().addComponents(textInput), new ActionRowBuilder().addComponents(textaddress), new ActionRowBuilder().addComponents(textHours), new ActionRowBuilder().addComponents(textMaterial)])
        await interaction.showModal(modal)
        client.placeholder.set(interaction.applicationId, textInput.data.placeholder)
    }
}