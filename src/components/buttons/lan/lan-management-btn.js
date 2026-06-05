const { MessageFlags, ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");
const logger = require("../../../functions/utils/Logger");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "lan-management-btn"
    },
    async execute (interaction, client) {
        await interaction.deferUpdate();

        const generalChannel = interaction.channel?.parent;
        const lanId = generalChannel?.topic;

        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.channel.send({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const text = new TextDisplayBuilder({ content: `Voici la liste des options possibles pour gérer la LAN :\n* 📝 Modifier la liste des participants\n* 🔒 Gestion des permissions de la LAN\n* 🖼️ Modifier le flyer\n* <:trash:1378419101751447582> Supprimer la LAN\n* <:add_participant:1472756154730938388> **Ajouter** un administrateur dans ce fil de gestion\n* <:remove_participant:1487896551316787220> **Retirer** un administrateur de ce fil de gestion\n\n-# La liste des options n'est pas définitive` });

        const deleteLanButton = new ButtonBuilder()
            .setCustomId("delete-lan-btn")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("<:trash:1378419101751447582>")

        const editParticipantsButton = new ButtonBuilder()
            .setCustomId("edit-participants-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📝")
        
        const editPermissionsButton = new ButtonBuilder()
            .setCustomId("edit-permissions-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🔒")
        
        const removeAdminButton = new ButtonBuilder()
            .setCustomId("remove-admin-btn")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("<:remove_participant:1487896551316787220>")

        const addAdminButton = new ButtonBuilder()
            .setCustomId("add-admin-btn")
            .setStyle(ButtonStyle.Success)
            .setEmoji("<:add_participant:1472756154730938388>")

        const editFlyerButton = new ButtonBuilder()
            .setCustomId("edit-flyer-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🖼️")

        const actionsRowOne = new ActionRowBuilder()
            .addComponents(editParticipantsButton, editPermissionsButton, editFlyerButton, deleteLanButton);
        
        const actionsRowTwo = new ActionRowBuilder()
            .addComponents(addAdminButton, removeAdminButton);
        
        const separator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)
            .addSeparatorComponents(separator)
            .addActionRowComponents(actionsRowOne, actionsRowTwo);
        
        return await interaction.channel.send({ components: [container], flags: [MessageFlags.IsComponentsV2] });
    }
}