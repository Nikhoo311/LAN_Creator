const { ActionRowBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const { color } = require("../../../../config/config.json");
const { configsForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "suppr-config-btn"
    },
    async execute (interaction, client) {
        const configs = configsForGuild(client, interaction.guildId);
        
        if (configs.length === 0) {
            return interaction.reply({ content: `❌ Vous ne pouvez pas supprimer une configuration s'il n'y existe aucune dans la base de données...`, flags: [MessageFlags.Ephemeral] })
        }

        const message = `# Suppression de configuration\nIci tu peux supprimer une configuration qui est présente sur la base de données\n\n# Informations\nPour supprimer une ou plusieurs configuration(s) de la base de données, il faut sélectionner le(s) nom(s) de configuration(s) à supprimer`

        let sConfig = configs.length > 1 ? "(s)" : "";
        const namesInBD = configs.map(lan => `* **${lan.name}**`).join("\n")

        const embedConfig = new EmbedBuilder()
            .setColor(color.red)
            .setDescription(`Je dispose de ${configs.length} configuration${sConfig}\n${namesInBD}`)
        
        const selectInput = new StringSelectMenuBuilder()
            .setCustomId("select-suppr-config")
            .setMinValues(1)
            .setMaxValues(configs.length)
        
        configs.forEach((k) => {
            selectInput.addOptions(new StringSelectMenuOptionBuilder({
                label: k.name,
                value: String(k._id)
            }).setEmoji('🏠'))
        })
        interaction.reply({ content: message, flags: [MessageFlags.Ephemeral], embeds: [embedConfig], components: [new ActionRowBuilder().addComponents(selectInput)] })
    }
}