const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, LabelBuilder } = require("discord.js");
const { createChannelSelectMenu } = require("../../../functions/utils/createChannelSelectMenu");

module.exports = {
    data: {
        name: "create-config-channel",
        multi: "delete-config-channel"
    },

    async execute(interaction, client) {
        const configName = interaction.message.embeds[0].fields[0].value;
        const config = client.configs.get(configName);

        const isDelete = interaction.customId === "delete-config-channel";

        const modalId = isDelete ? "delete-channel" : "create-channel";
        const modalTitle = isDelete ? "Supprimer salon(s)" : "Créer un salon";
        
        const modal = new ModalBuilder()
            .setCustomId("modal-" + modalId)
            .setTitle(`${config.name} — ${modalTitle}`);

        if (isDelete) {
            const selectMenu = createChannelSelectMenu({
                customId: "select-channel-delete",
                channels: config.channels.filter(ch => !ch.alwaysActive),
                placeholder: "Choisir un salon à supprimer"
            });

            const selectMenuLabel = new LabelBuilder()
                .setStringSelectMenuComponent(selectMenu)
                .setLabel("Le(s) salon(s) :")

            modal.addLabelComponents(selectMenuLabel);
        } else {
            const channelNameInput = new TextInputBuilder()
                .setCustomId("new-channel-name")
                .setPlaceholder("Entrez un nom (max 70 caractères)")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(70)
                .setRequired(true);
                    
            const channelNameInputLabel = new LabelBuilder()
                .setTextInputComponent(channelNameInput)
                .setLabel("Nom du salon :")
    
            modal.addLabelComponents(channelNameInputLabel)
        }
        return await interaction.showModal(modal);
    }
};