const { ActionRowBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const { color } = require("../../../../config/config.json");
const Config = require('../../../schemas/config');

module.exports = {
    data: {
        name: "modif-config-btn"
    },
    async execute (interaction, client) {
        const configs = await Config.find();
        if (configs.length === 0) {
            return interaction.reply({ content: `❌ Vous ne pouvez pas modifier une configuration s'il n'y existe aucune dans la base de données... `, flags: [MessageFlags.Ephemeral] })
        }
        
        const message = `# Modification de configuration\nSi tu veux, modifier une configuration de LAN, il suffit juste de sélection le nom de la configuration de laquelle tu veux effectuer les modifications !\nFait ton choix ! 😉`

        let sConfig = configs.length > 1 ? "(s)" : "";
        const namesInBD = configs.map(lan => `* **${lan.name}**`).join("\n")

        const embedConfig = new EmbedBuilder()
            .setColor(color.green)
            .setDescription(`Je dispose de ${configs.length} configuration${sConfig} dans ma base de donnée\n${namesInBD}`)
        
        const selectInput = new StringSelectMenuBuilder()
            .setCustomId("select-modif-config")
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