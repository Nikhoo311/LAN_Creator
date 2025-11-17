const { MessageFlags, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { color } = require("../../../../config/config.json")

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
        name: "modif-config"
    },
    async execute(interaction, client) {
        const configName = interaction.fields.getTextInputValue("config_name");
        const configaddress = interaction.fields.getTextInputValue("config_address");
        const configHours = interaction.fields.getTextInputValue("config_hours");
        const configMaterials = interaction.fields.getTextInputValue("config_material") || "Aucun";
        
        const placeholder = client.placeholder.get(interaction.applicationId);
        const currentConfig = client.configs.get(placeholder);

        const configUpdateEmbed = new EmbedBuilder()
            .setColor(color.green)
            .setTitle(`Configuration \`${configName}\``)
            .setFields(
                { name: `🏠 __Nom :__`, value: configName, inline: true },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: `🕑 __Horaire :__`, value: configHours, inline: true },
                { name: `📍 __Adresse :__`, value: configaddress, inline: true },
                { name: "\u200b", value: "\u200b", inline: true },
                { name: `🕹️ __Matériel disponible :__`, value: configMaterials, inline: false },
            )
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

        await interaction.update({ content: `✅ La configuration \`${placeholder}\` a bien été modifiée en \`${configName}\` avec succès !`, embeds: [configUpdateEmbed, configChannelsUpdateEmbed], components, flags: [MessageFlags.Ephemeral] })
    }
}