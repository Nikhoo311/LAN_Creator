const { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "create-config-channel"
    },

    async execute(interaction, client) {
        const configName = interaction.message.embeds[0].fields[0].value;
        let currentConfig = client.configs.get(configName);
        
        const modal = new ModalBuilder()
            .setCustomId("modal-create-channel")
            .setTitle(`${currentConfig.name} - Créer un salon`);

        const channelNameInput = new TextInputBuilder()
            .setCustomId("new-channel-name")
            .setPlaceholder("Entrez un nom de salon (max 70 caractères)")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(70)
            .setRequired(true);
        
        const channelNameInputLabel = new LabelBuilder()
            .setTextInputComponent(channelNameInput)
            .setLabel("Nom du salon :")

        modal.addLabelComponents(channelNameInputLabel);

        return await interaction.showModal(modal);
    }
};