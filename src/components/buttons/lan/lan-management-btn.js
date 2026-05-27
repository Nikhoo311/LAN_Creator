const { MessageFlags, ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { Lan } = require('../../../class/Lan');
const { getLanForGuild } = require("../../../functions/utils/guildCache");
const logger = require("../../../functions/utils/Logger");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "lan-management-btn"
    },
    async execute (interaction, client) {
        await interaction.deferUpdate();

        const generalChannel = interaction.guild.channels.cache.get(interaction.channelId)?.parent;
        const lanId = generalChannel?.topic;

        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const text = new TextDisplayBuilder({ content: `Voici la liste des options possibles pour gérer la LAN :\n* Modifier la liste des participants\n* Verrouiller l'acces à la LAN à certains membres du serveur (${interaction.guild.name})\n* Modifier le flyer\n* Supprimer la LAN\n\n-# La liste des options n'est pas définitive` });

        const deleteLanButton = new ButtonBuilder()
            .setCustomId("delete-lan-btn")
            .setLabel("Supprimer la LAN")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("<:trash:1378419101751447582>")

        const editParticipantsButton = new ButtonBuilder()
            .setCustomId("edit-participants-btn")
            .setLabel("Modifier la liste des participants")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📝")
        
        const editPermissionsButton = new ButtonBuilder()
            .setCustomId("edit-permissions-btn")
            .setLabel("Modifier les permissions")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🔒")
        
        const editFlyerButton = new ButtonBuilder()
            .setCustomId("edit-flyer-btn")
            .setLabel("Modifier le flyer")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🖼️")

        const actionsRowOne = new ActionRowBuilder()
            .addComponents(editParticipantsButton, editPermissionsButton, editFlyerButton);
        
        const actionsRowTwo = new ActionRowBuilder()
            .addComponents(deleteLanButton);

        const separator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)
            .addSeparatorComponents(separator)
            .addActionRowComponents(actionsRowOne)
            .addActionRowComponents(actionsRowTwo)
        
        return interaction.channel.send({ components: [container], flags: [MessageFlags.IsComponentsV2] });
    }
}