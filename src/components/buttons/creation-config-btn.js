const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
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
            .setLabel("Quel est le nom de la configuration de LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        
        const textAdress = new TextInputBuilder()
            .setCustomId("config_adress")
            .setLabel("Quelle est l'adresse de la LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("999 rue des champignons braisé - 05125 La Forêt")

        const textHours = new TextInputBuilder()
            .setCustomId("config_hours")
            .setLabel("Quelle est l'heure d'arrivé de la LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("19h00")

        const textMaterial = new TextInputBuilder()
            .setCustomId("config_material")
            .setLabel("Quel est le matériel disponible pour la LAN ?")
            .setRequired(false)
            .setPlaceholder("Par défaut : Aucun")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1500);

        modal.addComponents([new ActionRowBuilder().addComponents(textInput), new ActionRowBuilder().addComponents(textAdress), new ActionRowBuilder().addComponents(textHours), new ActionRowBuilder().addComponents(textMaterial)])
        await interaction.showModal(modal)
    }
}