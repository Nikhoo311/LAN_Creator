const { MessageFlags, TextDisplayBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "remove-lan-voice-channels-btn",
        multi: "retry-remove-lan-voice-channels-btn"
    },
    async execute (interaction, client) {
        const generalChannel = interaction.channel?.parent;
        const lanId = generalChannel?.topic;
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.customId !== "retry-remove-lan-voice-channels-btn") {
            await interaction.deferReply({
                withResponse: true,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const alwaysActiveNames = new Set(
            lan.config.channels
                .filter(c => c.alwaysActive)
                .map(c => c.name)
        );

        const guild = interaction.guild;

        const editableChannels = lan.channels.filter(ch => {
            if (alwaysActiveNames.has(ch.name)) return false;
            const discordChannel = guild.channels.cache.get(ch.channelId);
            return discordChannel?.type === ChannelType.GuildVoice;
        });

        if (!editableChannels.length) {
            return await interaction.editReply({ content: "❌ Aucun salon supprimable dans cette LAN.", flags: [MessageFlags.Ephemeral] });
        }   
        
        const channelSelect = new StringSelectMenuBuilder()
            .setCustomId("select-remove-channel")
            .setMinValues(1)
            .setMaxValues(editableChannels.length)
            .setPlaceholder("Salon(s) a retirer...")
            .setOptions(editableChannels.map(chObj => {
                return new StringSelectMenuOptionBuilder()
                    .setEmoji("<:channel_voice:1511456915312476230>")
                    .setLabel(guild.channels.cache.get(chObj.channelId).name ?? chObj.name)
                    .setValue(chObj.channelId)
            }))

        const text = new TextDisplayBuilder({ content: `Pour retirer un ou plusieurs salon(s) de la LAN ${lan.name}, Il faut sélectionner le(s) salon(s) concerné(s)` });
        
        if (interaction.customId === "retry-remove-lan-voice-channels-btn") {
            return await interaction.update({ components: [text, new ActionRowBuilder().addComponents(channelSelect)], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
        }

        return await interaction.editReply({ components: [text, new ActionRowBuilder().addComponents(channelSelect)], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }
}