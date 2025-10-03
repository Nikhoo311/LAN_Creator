const { ActionRowBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const { color } = require("../../../../config/config.json");
const Config = require('../../../schemas/config');

module.exports = {
    data: {
        name: "choose-config-btn"
    },
    async execute (interaction, client) {
        
        const message = `# Choisir une configuration\nIci c'est un espace où tu peux choisir ta configuration (lieu, heure, matériels) pour toute les prochaine LANs. C'est une configuration qui permettra de donner toutes les informations nécessaire aux participants pour les LANs que tu créeras !`

        const configs = await Config.find();
        if (configs.length === 0) {
            return interaction.reply({ content: "❌ Vous ne pouvez pas choisir une configuration s'il n'y existe aucune dans la base de données...", flags: [MessageFlags.Ephemeral] })
        }

        let sConfig = configs.length > 1 ? "(s)" : "";
        const namesInBD = configs.map(config => `* **${config.name}**`).join("\n")

        const embedConfig = new EmbedBuilder()
            .setColor(color.blue)
            .setDescription(`Je dispose de ${configs.length} configuration${sConfig} dans ma base de donnée\n${namesInBD}`)
        
        const selectInput = new StringSelectMenuBuilder()
            .setCustomId("select-choose-config")
            .setMaxValues(1)
            .setMinValues(1)
        
        configs.map(k => {
            selectInput.addOptions(new StringSelectMenuOptionBuilder({
                label: k.name,
                value: k.name 
            }).setEmoji('🏠'))
        })
        interaction.reply({ content: message, embeds: [embedConfig], components: [new ActionRowBuilder().addComponents(selectInput)], flags: [MessageFlags.Ephemeral] })
    }
}