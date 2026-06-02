const { MessageFlags, TextDisplayBuilder, ContainerBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder } = require("discord.js");
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "lan_edit_flyer"
    },
    async execute (interaction, client) {
        await interaction.deferReply({ withResponse: true, flags: [MessageFlags.Ephemeral] });
        
        const generalChannel = interaction.guild.channels.cache.get(interaction.channelId)?.parent;
        const lanId = generalChannel?.topic;
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.editReply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        let fileImage = interaction.fields.getUploadedFiles("file_flyer_image", false)?.first() || null;
        const flyerName = interaction.fields.getTextInputValue("flyer_name") || fileImage?.name || "flyer.png";
    
        try {
            if (fileImage?.contentType && !["image/png", "image/jpg", "image/jpeg", "image/gif"].includes(fileImage.contentType)) {
                throw new Error(`Le type de fichier \`${fileImage.name.split(".").pop()}\` n'est pas prit en compte.`);
            }
            const extension = fileImage?.name.split(".").pop().toLowerCase();

            const clientMessages = await generalChannel.messages.fetch({ limit: 100 });

            // Find the first message containing an image attachment (no embeds, no components)
            const flyerMessage = clientMessages.find(msg =>
                msg.author.id === client.user.id &&
                msg.attachments.size > 0 &&
                msg.embeds.length === 0 &&
                msg.components.length === 0 &&
                msg.attachments.some(att => att.contentType && att.contentType.startsWith("image/"))
            );
           
            // Download the image buffer from the ephemeral URL before it expires
            const imageResponse = await fetch(fileImage.url);
            if (!imageResponse.ok) throw new Error("Impossible de télécharger l'image.");
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

            const newFlyerAttachment = new AttachmentBuilder(imageBuffer)
                .setDescription(`Flyer de la LAN ${lan.name}`)
                .setName(`${flyerName}.${extension}`);

            if (flyerMessage) {
                await flyerMessage.edit({ files: [newFlyerAttachment] });
            } else {
                await generalChannel.send({ files: [newFlyerAttachment] });
            }

            const text = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n+ Le flyer a été mis à jour avec succès !\`\`\`\n[Cliquer ici pour voir le flyer mis à jour](${flyerMessage.url})` });

            const viewFlyerButton = new ButtonBuilder()
                .setLabel("Voir le flyer")
                .setStyle(ButtonStyle.Link)
                .setEmoji("<:see:1511176625214062612>")
                .setURL(flyerMessage.url);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(text)
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
                .addActionRowComponents(new ActionRowBuilder().addComponents(viewFlyerButton));
            return interaction.editReply({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });

        } catch (error) {
            const textError = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n- Une erreur est survenue lors de la mise à jour du flyer. Veuillez réessayer.\n\nErreur :\n${error.message}\n${error.cause}\`\`\`` });
            
            const containerError = new ContainerBuilder()
                .addTextDisplayComponents(textError);
            return interaction.editReply({ components: [containerError], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
        }
    }
}