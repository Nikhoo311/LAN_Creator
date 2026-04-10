const { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, FileUploadBuilder, RadioGroupBuilder, RadioGroupOptionBuilder, CheckboxGroupBuilder, CheckboxBuilder, UserSelectMenuBuilder } = require("discord.js");


module.exports = {
    data: {
        name: "edit-recap-btn"
    },
    async execute (interaction, client) {
        const { lanOptions } = client.placeholder.get(`${interaction.applicationId}-${interaction.guildId}`)
        
        const modal = new ModalBuilder()
            .setCustomId("lan_edit_recap")
            .setTitle("Edition des options")
 
        const textInput = new TextInputBuilder()
            .setCustomId("lan_start_date")
            .setPlaceholder("Ex : 03/02/2026")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
            
        const textInputLabel = new LabelBuilder()
            .setTextInputComponent(textInput)
            .setLabel("Quand est le début de la LAN ?")
            
        const textInput2 = new TextInputBuilder()
            .setCustomId("lan_end_date")
            .setPlaceholder("Ex : 06/02/2026")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        
        const textInput2Label = new LabelBuilder()
            .setTextInputComponent(textInput2)
            .setLabel("Quand est la fin de la LAN ?")

        const textInputGoogleLink = new TextInputBuilder()
            .setCustomId("lan_google_sheet_link")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        
        const textInputGoogleLinkLabel = new LabelBuilder()
            .setTextInputComponent(textInputGoogleLink)
            .setLabel("Lien du Google Sheet :")

        const defaultParticipantInput = new UserSelectMenuBuilder()    
            .setCustomId("lan_participants")
            .setMinValues(1)
            .setMaxValues(10)
            .setPlaceholder("Saisir les participants qui seront déjà présent à la LAN")
            .setRequired(true)
        
        const defaultParticipantInputLabel = new LabelBuilder()
            .setUserSelectMenuComponent(defaultParticipantInput)
            .setLabel("La liste des participants :")

        
        const mapping = {
            "set_lan_date-btn": [textInputLabel, textInput2Label],
            "add_default_participants_list": [defaultParticipantInputLabel],
            "add_google_sheet-btn": [textInputGoogleLinkLabel],
        };

        lanOptions.forEach(option => {
            const componentsToAdd = mapping[option];
            if (componentsToAdd) {
                modal.addLabelComponents(...componentsToAdd);
            }
        });
        return await interaction.showModal(modal)
    }
}