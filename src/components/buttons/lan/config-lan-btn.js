const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { readFileSync } = require("fs");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "config-lan-btn"
    },
    async execute (interaction, client) {
        const message = `# Configuration de LAN\nIci c'est l'espace où tu peux créer / modifier et supprimer des configurations pour les LANs. \n# Informations\n * Pour créer il faut cliquer sur le bouton \`Créer\` et ensuite rentrer toutes les informations nécessaires.\n * Pour modifier il faut cliquer sur le bouton \`Modifier\` et sélectionner une configuration à modifier et ensuite remplir les informations qu'il faut modifier.\n * Pour supprimer une configuration il faut cliquer sur le bouton \`Supprimer\` puis sélectionner la configuration qu'il faut supprimer via le menu de sélection et c'est fini !\n* Enfin, pour choisir une configuration pour les LANs, il faut cliquer sur le bouton \`Choisir\` et sélectionner la configuration qu'il faut.`
        const bd = JSON.parse(readFileSync("./config/bd.json", "utf-8"))["bd"];
        let sConfig = bd.length > 1 ? "(s)" : "";
        let namesInBD = "";
        bd.forEach(lan => namesInBD += `* **${lan.name}**\n`)

        const embedConfig = new EmbedBuilder()
            .setColor(color.green)
            .setDescription(`Je dispose de ${bd.length} configuration${sConfig} dans ma base de donnée\n${namesInBD}`)
        
        const creationConfigBtn = new ButtonBuilder()
            .setCustomId("creation-config-btn")
            .setLabel("Créer")
            .setStyle(ButtonStyle.Success)
            .setEmoji("➕")
        
        const modifConfigBtn = new ButtonBuilder()
            .setCustomId("modif-config-btn")
            .setLabel("Modifier")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📝")
        
        const supprConfigBtn = new ButtonBuilder()
            .setCustomId("suppr-config-btn")
            .setLabel("Supprimer")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("✖️")
        
        const chooseConfigBtn = new ButtonBuilder()
            .setCustomId("choose-config-btn")
            .setLabel("Choisir")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📌")
        interaction.reply({ content: message, embeds: [embedConfig], components: [new ActionRowBuilder().addComponents(chooseConfigBtn).addComponents(creationConfigBtn).addComponents(modifConfigBtn).addComponents(supprConfigBtn)], flags: [MessageFlags.Ephemeral] })
    }
}