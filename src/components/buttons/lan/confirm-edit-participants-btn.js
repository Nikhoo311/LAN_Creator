const { MessageFlags, TextDisplayBuilder, ContainerBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "confirm-edit-participants-btn"
    },
    async execute (interaction, client) {
        const generalChannel = interaction.guild.channels.cache.get(interaction.channelId)?.parent;
        const lanId = generalChannel?.topic;
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const newParticipantsIds = client.placeholder.get(`edit_${lan.id}_participants`);
        client.placeholder.delete(`edit_${lan.id}_participants`);

        let attachment = null;
        if (newParticipantsIds.length > 0) {
            const participantsImageURL = interaction.message.components[0].components[1].items[0].media.data.url;
            
            const imageResponse = await fetch(participantsImageURL);
            if (!imageResponse.ok) {
                return interaction.reply({ content: "❌ Impossible de récupérer l'image.", flags: [MessageFlags.Ephemeral] });
            }
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

            attachment = new AttachmentBuilder(imageBuffer, { name: `participants_${lan.id}.png` });
        }

        lan.resetParticipants();

        await lan.setParticipants(newParticipantsIds);

        const text = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n+ La nouvelle liste de participants est maintenant à jour.\`\`\``} )
        
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)

        await interaction.update({ components: [container], files: [], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
        
        const message = `## Nouvelle liste de participants !\n\n> 👉 Clique sur le bouton ci-dessous pour réserver ta place et rejoindre l'aventure !`
        const participantsEmbed = new EmbedBuilder()
            .setColor(color.red)
            .setDescription("## Liste des participants :")
        
        if (newParticipantsIds.length > 0) {
            participantsEmbed.setImage(`attachment://${attachment.name}`);
        }

        const participantsButton = new ButtonBuilder()
            .setCustomId("add-participants-btn")
            .setLabel("Participer a la LAN")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:add_participant:1472756154730938388>");
        
        const removeParticipantsButton = new ButtonBuilder()
            .setCustomId("remove-participants-btn")
            .setLabel("Se désinscrire a la LAN")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("<:remove_participant:1487896551316787220>");

        await generalChannel.messages.fetch(msg => msg.content.includes("> 👉")).then(async (messages) => {
            if (messages.size > 0) {
                const msg = messages.first();
                await msg.edit({ content: "-# Cette liste de participants a changé. Une nouvelle est disponible.", components: [] });
            }
        }).catch(async (error) => { console.error("Aucun message de réservation trouvé\n", error); });

        return await generalChannel.send({
            content: message,
            embeds: [participantsEmbed],
            components: [new ActionRowBuilder().addComponents(participantsButton, removeParticipantsButton)],
            files: attachment ? [attachment] : []
        });
    }
}