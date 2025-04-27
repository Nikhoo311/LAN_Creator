const { ActionRowBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const { readFileSync } = require("fs");
const { color } = require("../../../config/config.json");

module.exports = {
    data: {
        name: "choose-config-btn"
    },
    async execute (interaction, client) {
        
        const message = `# Choisir une configuration\nIci c'est un espace où tu peux choisir ta configuration (lieu, heure, matériels) pour toute les prochaine LANs. C'est une configuration qui permettra de donner toutes les informations nécessaire aux participants pour les LANs que tu créeras !`

        const bd = JSON.parse(readFileSync("./config/bd.json", "utf-8"))["bd"];
        if (bd.length === 0) {
            return interaction.reply({ content: "❌ Vous ne pouvez pas choisir une configuration s'il n'y existe aucune dans la base de données...", flags: [MessageFlags.Ephemeral] })
        }

        let sConfig = bd.length > 1 ? "(s)" : "";
        let namesInBD = "";
        bd.forEach(lan => namesInBD += `* **${lan.name}**\n`)

        const embedConfig = new EmbedBuilder()
            .setColor(color.blue)
            .setDescription(`Je dispose de ${bd.length} configuration${sConfig} dans ma base de donnée\n${namesInBD}`)
        
        const selectInput = new StringSelectMenuBuilder()
            .setCustomId("select-choose-config")
            .setMaxValues(1)
            .setMinValues(1)
        
        bd.forEach(k => {
            selectInput.addOptions(new StringSelectMenuOptionBuilder({
                label: k.name,
                value: k.name 
            }).setEmoji('🏠'))
        })
        interaction.reply({ content: message, embeds: [embedConfig], components: [new ActionRowBuilder().addComponents(selectInput)], flags: [MessageFlags.Ephemeral] })
    }
}