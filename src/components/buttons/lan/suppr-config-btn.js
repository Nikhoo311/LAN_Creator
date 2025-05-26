const { ActionRowBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const { readFileSync } = require("fs");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "suppr-config-btn"
    },
    async execute (interaction, client) {
        const message = `# Suppression de configuration\nIci tu peux supprimer une configuration qui est présente sur la base de données\n\n## Informations\nPour supprimer une ou plusieurs configuration(s) de la base de données, il faut sélectionner le(s) nom(s) de configuration(s) à supprimer`
        const bd = JSON.parse(readFileSync("./config/bd.json", "utf-8"))["bd"];

        let sConfig = bd.length > 1 ? "(s)" : "";
        let namesInBD = "";
        bd.forEach(lan => namesInBD += `* **${lan.name}**\n`)
        
        if (bd.length == 0) {
            return interaction.reply({ content: "❌ Vous ne pouvez pas supprimer une configuration s'il n'y existe aucune dans la base de données...", flags: [MessageFlags.Ephemeral] })
        }

        const embedConfig = new EmbedBuilder()
            .setColor(color.red)
            .setDescription(`Je dispose de ${bd.length} configuration${sConfig} dans ma base de donnée\n${namesInBD}`)
        
        const selectInput = new StringSelectMenuBuilder()
            .setCustomId("select-suppr-config")
            .setMinValues(1)
            .setMaxValues(bd.length)
        
        bd.forEach(k => {
            selectInput.addOptions(new StringSelectMenuOptionBuilder({
                label: k.name,
                value: k.name 
            }).setEmoji('🏠'))
        })
        interaction.reply({ content: message, flags: [MessageFlags.Ephemeral], embeds: [embedConfig], components: [new ActionRowBuilder().addComponents(selectInput)] })
    }
}