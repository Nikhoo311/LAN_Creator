const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { color } = require("../../../../config/config.json");
const Config = require("../../../schemas/config");
const { createChannelSelectMenu } = require("../../../functions/utils/createChannelSelectMenu");
const { Types } = require('mongoose');

module.exports = {
    data: {
        name: "modal-create-channel",
        multi: "modal-delete-channel"
    },
    async execute(interaction, client) {
        const dbConfig = await Config.findOne({ name: interaction.message.embeds[0].fields[0].value });
        let currentConfig = client.configs.get(interaction.message.embeds[0].fields[0].value);
        
        if (interaction.customId === "modal-create-channel") {
            const newChannelName = interaction.fields.getTextInputValue("new-channel-name");

            const newChannel = {
                _id: new Types.ObjectId(),
                name: newChannelName,
                active: false,
                alwaysActive: false
            };

            currentConfig.channels.push(newChannel);
            client.configs.set(currentConfig.name, currentConfig);
        } 
        else {
            const channelsNames = interaction.fields.getStringSelectValues("select-channel-delete");
            currentConfig.channels = currentConfig.channels.filter(ch => !channelsNames.includes(ch.name));
            client.configs.set(currentConfig.name, currentConfig);
        }
        const configChannelsUpdateEmbed = new EmbedBuilder()
            .setColor(color.orange)
            .setTitle("Les salons actifs")
            .setDescription(
                currentConfig.channels
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(ch => {
                    const lockEmoji = ch.alwaysActive ? " 🔒" : "";
                    const statusEmoji = ch.active ? "<:switch_enabled:1379563207760548022>" : "<:switch_disabled:1379563278681772144>";

                    return `### ${statusEmoji} ${ch.name}${lockEmoji}`;
                })
                .join("\n")
            )
            .setFooter({text: `${currentConfig.channels.length} salon${currentConfig.channels.length > 1 ? "s" : ""}`});

        
        const createChannel = new ButtonBuilder()
            .setCustomId("create-config-channel")
            .setLabel("Créer un salon")
            .setEmoji("<:channel:1440082251366010983>")
            .setStyle(ButtonStyle.Secondary);

        const saveBtn = new ButtonBuilder()
            .setCustomId("save-update-config")
            .setLabel("Enregistrer")
            .setEmoji("💾")
            .setStyle(ButtonStyle.Success)

        let components = [new ActionRowBuilder().addComponents(createChannel, saveBtn)];

        if (currentConfig.channels.length > currentConfig.channels.filter(ch => ch.alwaysActive).length) {
            const modifiableChannels = currentConfig.channels.filter(ch => !ch.alwaysActive);
            
            const deleteChannel = new ButtonBuilder()
                .setCustomId("delete-config-channel")
                .setLabel("Supprimer un salon")
                .setEmoji("<:trash:1378419101751447582>")
                .setStyle(ButtonStyle.Danger);
 
            components[0].setComponents(createChannel, deleteChannel, saveBtn);

            const selectStatusChannelEnable = createChannelSelectMenu({
                customId: "select-modif-status-channel-active",
                placeholder: "✅ Activer des salons",
                channels: modifiableChannels
            })

            const selectStatusChannelDisable = createChannelSelectMenu({
                customId: "select-modif-status-channel-desactive",
                placeholder: "❌ Désactiver des salons",
                channels: modifiableChannels
            })

            components.push(
                new ActionRowBuilder().addComponents(selectStatusChannelEnable),
                new ActionRowBuilder().addComponents(selectStatusChannelDisable),
            );
        }
        return await interaction.update({ embeds: [interaction.message.embeds[0], configChannelsUpdateEmbed], components });
    }
}