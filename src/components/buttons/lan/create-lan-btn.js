const { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags, FileUploadBuilder } = require("discord.js");
const { decrypt } = require("../../../functions/utils/crypt");
const { readFileSync } = require('fs');

module.exports = {
    data: {
        name: "create-lan-btn"
    },
    async execute (interaction, client) {
        if (client.configs.size === 0) return interaction.reply({ content: "❌ Impossible de créer une LAN si aucune configuration est créée... Clique sur le bouton `Configurer`.", flags: [MessageFlags.Ephemeral] })    
        const modal = new ModalBuilder()
            .setCustomId("lan_create")
            .setTitle("Création LAN")
 
        const textInput = new TextInputBuilder()
            .setCustomId("lan_name")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        
        const textInputLabel = new LabelBuilder()
            .setTextInputComponent(textInput)
            .setLabel("Quel est le nom de LAN ?")

        
        const chosenConfig = JSON.parse(readFileSync("./config/choose-config.json", "utf-8")).config_chosen;
        const configName = new StringSelectMenuBuilder()    
            .setCustomId("lan_config_name")
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder("Choisir une configuration disponible...")
            .setRequired(!client.configs.get(chosenConfig))
            .setOptions(
                client.configs.map(config => {
                    return new StringSelectMenuOptionBuilder()
                        .setEmoji({name: '🏠'})
                        .setLabel(config.name)
                        .setValue(config.name)
                        .setDescription(decrypt(config.address, process.env.TOKEN))
                        .setDefault(config.name == chosenConfig)
                })
           )
        
        const configNameLabel = new LabelBuilder()
           .setStringSelectMenuComponent(configName)
           .setLabel("Configuration de LAN utilisée :")

        const textGoogleSheet = new TextInputBuilder()
            .setCustomId("lan_google_sheet")
            .setRequired(false)
            .setStyle(TextInputStyle.Short);

        const textGoogleSheetLabel = new LabelBuilder()
            .setTextInputComponent(textGoogleSheet)
            .setLabel("Quel est le Google Sheet de la LAN ?")
        
        const textNbVoc = new TextInputBuilder()
            .setCustomId("lan_nb_voc")
            .setRequired(false)
            .setPlaceholder("Entre 1 et 5 | Par défaut : 1")
            .setStyle(TextInputStyle.Short);

        const textNbVocLabel = new LabelBuilder()   
            .setTextInputComponent(textNbVoc)
            .setLabel("Quel est le nombre de salons vocaux ?")
        
        const fileFlyer = new FileUploadBuilder()
           .setCustomId("file_flyer_image")
           .setMinValues(1)
           .setMaxValues(1)
           .setRequired(false)

        const fileFlyerLabel = new LabelBuilder()
           .setFileUploadComponent(fileFlyer)
           .setLabel("Image de LAN :")
           .setDescription("Format : png / jpeg / jpg / gif");

        modal.addLabelComponents(textInputLabel, configNameLabel, fileFlyerLabel, textGoogleSheetLabel, textNbVocLabel)
        return await interaction.showModal(modal)
    }
}