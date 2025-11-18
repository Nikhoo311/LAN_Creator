const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonStyle } = require('discord.js');
const { color } = require("../../../../config/config.json");
const Config = require("../../../schemas/config");

function createChannelSelectMenu({ customId, placeholder, channels }) {
    return new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setMinValues(1)
      .setMaxValues(channels.length)
      .setPlaceholder(placeholder)
      .setOptions(
        channels.map(ch => 
          new StringSelectMenuOptionBuilder()
            .setLabel(ch.name)
            .setValue(ch.name)
            .setEmoji("<:channel:1440082251366010983>")
        )
      );
}

module.exports = {
    data: {
        name: "modal-create-channel"
    },
    async execute(interaction, client) {
        const newChannelName = interaction.fields.getTextInputValue("new-channel-name");
        
        const newChannel = {
            name: newChannelName,
            active: false,
            alwaysActive: false
        };

        const dbConfig = await Config.findOne({ name: interaction.message.embeds[0].fields[0].value });
        let currentConfig = client.configs.get(interaction.message.embeds[0].fields[0].value);

        dbConfig.channels.push(newChannel);
        await dbConfig.save();

        currentConfig.channels.push(newChannel);
        client.configs.set(currentConfig.name, currentConfig);

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
        
        let components = [new ActionRowBuilder().addComponents(createChannel)];

        if (currentConfig.channels.length > currentConfig.channels.filter(ch => ch.alwaysActive).length) {
            const modifiableChannels = currentConfig.channels.filter(ch => !ch.alwaysActive);

            const selectStatusChannelEnable = createChannelSelectMenu({
                customId: "select-modif-status-channel-active",
                placeholder: "✅ Activer des salons",
                channels: modifiableChannels
            }).setMaxValues(modifiableChannels.length);

            const selectStatusChannelDisable = createChannelSelectMenu({
                customId: "select-modif-status-channel-desactive",
                placeholder: "❌ Désactiver des salons",
                channels: modifiableChannels
            }).setMaxValues(modifiableChannels.length);

            const saveBtn = new ButtonBuilder()
                .setCustomId("save-update-config")
                .setLabel("Enregistrer")
                .setEmoji("💾")
                .setStyle(ButtonStyle.Success)

            components[0].addComponents(saveBtn)
            components.push(
                new ActionRowBuilder().addComponents(selectStatusChannelEnable),
                new ActionRowBuilder().addComponents(selectStatusChannelDisable),
            );
        }
        return await interaction.update({ embeds: [interaction.message.embeds[0], configChannelsUpdateEmbed], components });
    }
}