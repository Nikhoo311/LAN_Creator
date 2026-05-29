const { MessageFlags, ModalBuilder, UserSelectMenuBuilder, LabelBuilder } = require('discord.js');

module.exports = {
    data: {
        name: "edit-participants-btn"
    },
    async execute (interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId("lan_edit_participants")
            .setTitle("Edition la liste des participants")

        const defaultParticipantInput = new UserSelectMenuBuilder()    
            .setCustomId("lan_participants")
            .setMinValues(1)
            .setMaxValues(10)
            .setPlaceholder("Saisir les participants qui seront déjà présent à la LAN")
            .setRequired(false)
        
        const defaultParticipantInputLabel = new LabelBuilder()
            .setUserSelectMenuComponent(defaultParticipantInput)
            .setLabel("La liste des participants :")
            .setDescription("Pour ne mettre personne, laisse vide.")
        
        modal.addComponents(defaultParticipantInputLabel);
        return await interaction.showModal(modal);
    }
}