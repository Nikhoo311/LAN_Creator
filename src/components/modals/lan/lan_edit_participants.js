const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorSpacingSize, SeparatorBuilder, MediaGalleryBuilder, AttachmentBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "lan_edit_participants"
    },
    async execute (interaction, client) {
        let participantsIds = interaction.fields.getSelectedUsers("lan_participants");
        
        const generalChannel = interaction.guild.channels.cache.get(interaction.channelId)?.parent;
        const lanId = generalChannel?.topic;
        
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }
        
        let participantsImage = null;
        let attachment = null;
        let mediaGallery = null;

        if (participantsIds && participantsIds.size > 0) {
            participantsIds = participantsIds.map(user => user.id);
            participantsImage = await lan.generateParticipantsImage(interaction.guild, 64, participantsIds);
            attachment = new AttachmentBuilder(participantsImage, { name: `participants_${lan.id}.png` });
            mediaGallery = new MediaGalleryBuilder()
                .addItems([
                    {
                        media: {
                            url: `attachment://participants_${lan.id}.png`
                        }
                    }
                ])
        }

        client.placeholder.set(`edit_${lan.id}_participants`, participantsIds);
        
        const text = new TextDisplayBuilder({ content: `Voici la nouvelle liste des participants de la LAN :` });
        const textNoParticipants = new TextDisplayBuilder({ content: `**Aucun participant pour le moment...**` });
        const textTow = new TextDisplayBuilder({ content: `### *Êtes-vous sûr de vouloir modifier la liste des participants ?*` });
        
        const seperator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)

        const yesButton = new ButtonBuilder()
            .setCustomId("confirm-edit-participants-btn")
            .setLabel("Confirmer")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✅")
        
        const noButton = new ButtonBuilder()
            .setCustomId("cancel-edit-participants-btn")
            .setLabel("Annuler")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("✖️")
        
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)
        
        participantsIds ? container.addMediaGalleryComponents(mediaGallery) : container.addTextDisplayComponents(textNoParticipants);

        container.addTextDisplayComponents(textTow)
            .addSeparatorComponents(seperator)
            .addActionRowComponents(new ActionRowBuilder().addComponents(yesButton, noButton))

        return await interaction.reply({ components: [container], files: attachment ? [attachment] : [], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }
}