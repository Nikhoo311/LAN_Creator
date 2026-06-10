const { MessageFlags, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle, ContainerBuilder, ActionRowBuilder } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "delete-lan-btn"
    },
    async execute (interaction, client) {
        const generalChannel = interaction.channel?.parent;
        const lanId = generalChannel?.topic;
        
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const text = new TextDisplayBuilder({ content: `### *Êtes-vous sûr de vouloir supprimer la ${lan.name} ?*` });
        
        const seperator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)

        const yesButton = new ButtonBuilder()
            .setCustomId("confirm-delete-lan-btn")
            .setLabel("Confirmer")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✅")
        
        const noButton = new ButtonBuilder()
            .setCustomId("cancel-delete-lan-btn")
            .setLabel("Annuler")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("✖️")
        
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)
            .addSeparatorComponents(seperator)
            .addActionRowComponents(new ActionRowBuilder().addComponents(yesButton, noButton))
        return await interaction.reply({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }
}