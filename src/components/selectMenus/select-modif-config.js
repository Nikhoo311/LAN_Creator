const { readFileSync } = require("fs");
const { TextInputBuilder, TextInputStyle, ModalBuilder, ActionRowBuilder } = require("discord.js");
const { color } = require("../../../config/config.json");

module.exports = {
    data: {
        name: "select-modif-config"
    },
    async execute(interaction, client) {
        const info = interaction.values[0]
        // Get the data base
        const file = JSON.parse(readFileSync("./config/bd.json", "utf-8"))["bd"];

        function getInfoConfig(name) {
            let result;
            file.forEach(element => {
                if (element.name == name) {
                    result = element
                }
            });
            return result;
        }

        const config = getInfoConfig(info)
        
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
        
        const textAdress = new TextInputBuilder()
            .setCustomId("config_adress")
            .setLabel("Quelle est l'adresse de la LAN ?")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("999 rue des champignons braisé - 05125 La Forêt")
            .setValue(config.adress)

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

        modal.addComponents([new ActionRowBuilder().addComponents(textInput), new ActionRowBuilder().addComponents(textAdress), new ActionRowBuilder().addComponents(textHours), new ActionRowBuilder().addComponents(textMaterial)])
        await interaction.showModal(modal)
        client.placeholder.set(interaction.applicationId, textInput.data.placeholder)
    }
}