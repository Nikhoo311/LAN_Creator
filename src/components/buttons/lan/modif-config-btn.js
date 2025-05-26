const { ActionRowBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const { readFileSync } = require("fs");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "modif-config-btn"
    },
    async execute (interaction, client) {
        
        const message = `# Modification de configuration\nSi tu veux, modifier une configuration de LAN, il suffit juste de sélection le nom de la configuration de laquelle tu veux effectuer les modifications !\nFait ton choix ! 😉`

        const bd = JSON.parse(readFileSync("./config/bd.json", "utf-8"))["bd"];
        let sConfig = bd.length > 1 ? "(s)" : "";
        let namesInBD = "";
        bd.forEach(lan => namesInBD += `* **${lan.name}**\n`)

        const embedConfig = new EmbedBuilder()
            .setColor(color.green)
            .setDescription(`Je dispose de ${bd.length} configuration${sConfig} dans ma base de donnée\n${namesInBD}`)
        
        const selectInput = new StringSelectMenuBuilder()
            .setCustomId("select-modif-config")
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