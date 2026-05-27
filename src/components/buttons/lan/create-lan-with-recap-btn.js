const { ButtonStyle, MessageFlags, ChannelType, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, TextDisplayBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } = require("discord.js");
const { Lan } = require("../../../class/Lan");
const { color } = require("../../../../config/config.json");
const { getGuildConfig } = require("../../../functions/utils/guildCache");
const { decrypt } = require("../../../functions/utils/crypt");
const logger = require("../../../functions/utils/Logger");
const { readFileSync } = require("fs");

function parseRecapContainer(recapContainer) {
    const result = {
        dates: null,
        participants: [],
        googleSheetLink: null,
        nbVocal: null,
        configId: null
    };

    // ================= TEXT =================
    const textComponent = recapContainer.components.find(c => c.data?.content);
    const content = textComponent?.data?.content || "";

    // ================= DATES =================
    const dateRegex = /\*\*Date de début :\*\* <t:(\d+):D>\n\*\*Date de fin :\*\* <t:(\d+):D>/;
    const dateMatch = content.match(dateRegex);

    if (dateMatch) {
        result.dates = {
            startDate: new Date(dateMatch[1] * 1000),
            endDate: new Date(dateMatch[2] * 1000)
        };
    }

    // ================= PARTICIPANTS =================
    const participantsRegex = /\*\*Liste des participants :\*\*\n([\s\S]*?)(?=\n\n|$)/;
    const participantsMatch = content.match(participantsRegex);

    if (participantsMatch) {
        result.participants = participantsMatch[1]
            .match(/<@(\d+)>/g)
            ?.map(p => p.replace(/\D/g, "")) || [];
    }

    // ================= GOOGLE SHEET =================
    const lastComponent = recapContainer.components[recapContainer.components.length - 1];

    if (lastComponent?.components) {
        const lastButton = lastComponent.components[lastComponent.components.length - 1];

        if (lastButton?.data?.style === ButtonStyle.Link) {
            result.googleSheetLink = lastButton.data.url || null;
        }
    }

    // ================= VOC CHANNELS NUMBER =================
    const vocalMatch = content.match(/\+\s*(\d+)/);

    if (vocalMatch) {
        result.nbVocal = parseInt(vocalMatch[1], 10);
    }

    // ================= CONFIG ID =================
    const match = content.match(/\(([^)]+)\)/);
    if (match) {
        result.configId = match[1];;
    }

    return result;
}

module.exports = {
    data: {
        name: "create-lan-with-recap-btn"
    },
    async execute (interaction, client) {
        const { haveLanFlyer } = client.placeholder.get(`${interaction.applicationId}-${interaction.guildId}`)
        const recapContainer = interaction.message.components[haveLanFlyer ? 1 : 0];
        const canCreate = recapContainer.components[2].content.includes("❌");
        
        if (canCreate) {
            return await interaction.reply({ content: "❌ Il faut valider toutes les étapes avant de créer la LAN.", flags: [MessageFlags.Ephemeral] });
        }

        const guild = interaction.guild;
        
        const lanName = recapContainer.components[0].content.split("\n\n")[0].split('\n')[1].split('** ')[1];
        const data = parseRecapContainer(recapContainer);

        const imgUrl = haveLanFlyer ? interaction.message.components[0].components[0].items[0].media.data.url : null;
        const image = new AttachmentBuilder(imgUrl).setName("flyer.png");

        const config = getGuildConfig(client, data.configId, interaction.guildId);
        if (!config) {
            return await interaction.reply({ content: "❌ Configuration introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        try {
            await interaction.deferReply({
                withResponse: true,
                flags: [MessageFlags.Ephemeral]
            });
            const category = await guild.channels.create({
                name: `${lanName}`,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        allow: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            })
            const textChannels = config.channels.filter(ch => ch.active)
                .map(ch => {
                    return (async () => {
                        const discordChannel = await guild.channels.create({
                            name: ch.name,
                            type: ChannelType.GuildText,
                            parent: category.id
                        });
                        return {
                            name: ch.name,
                            channelId: discordChannel.id
                        };
                    })();
                });

            const channels = await Promise.all(textChannels);
            const generalChannel = guild.channels.cache.get(channels.find(ch => ch.name == "général").channelId);
            if (imgUrl) {
                await generalChannel.send({ files: [image] });
            }

            const informationChannel = guild.channels.cache.get(channels.find(ch => ch.name == "informations").channelId);

            let vcChannels = []

            for (let index = 0; index < data.nbVocal; index++) {
                let vcChannel = await guild.channels.create({
                    name: `🔊 Vocal ${index + 1}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                })

                vcChannels.push({
                    name: `🔊 Vocal ${index + 1}`,
                    channelId: vcChannel.id
                });
            }

            // Creation d'un objet LAN
            const channelsArray = [...channels, ...vcChannels];

            const startedSec = data.dates?.startDate ? Math.floor(new Date(data.dates.startDate).getTime() / 1000) : null;
            const endedSec = data.dates?.endDate ? Math.floor(new Date(data.dates.endDate).getTime() / 1000) : null;
            
            const lan = new Lan(lanName, channelsArray, config, data.participants, null, startedSec, endedSec, interaction.guildId);
            await lan.create();

            const logistiqueEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription(data.googleSheetLink ? `📋 **__Logistique :__**\nToutes les informations logistiques sont disponibles dans ce Google Sheet : [Lien du Google Sheet](${data.googleSheetLink})` : "> Demander à l'hôte les informations pour la logistique")
                .setTimestamp()
            let googleSheetButton = null;

            if (data.googleSheetLink) {
                googleSheetButton = new ButtonBuilder()
                    .setLabel("Google Sheet")
                    .setStyle(ButtonStyle.Link)
                    .setURL(data.googleSheetLink)
            }
            
            const btnaddressMaps = new ButtonBuilder()
                .setLabel("Itinéraire Google Maps")
                .setStyle(ButtonStyle.Link)
                .setEmoji("📍")
                .setURL(lan.getGoogleMapsLink())
            
            const btnaddressWaze = new ButtonBuilder()
                .setLabel("Itinéraire Waze")
                .setStyle(ButtonStyle.Link)
                .setEmoji("📍")
                .setURL(lan.getWazeLink())
            
            const informationEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription(`🔍 **__Informations :__**\nVoici toutes les infomations principales pour **${lanName}**`)
                .addFields([
                    {
                        name: "📌 **__Lieu :__**", value: decrypt(config.address, process.env.TOKEN), inline: true
                    },
                    {
                        name: "🧭 **__Horaire :__**", value: `* Début : <t:${lan.startedAt}:F>\n* Fin : <t:${lan.endedAt}:F>` , inline: true
                    },
                    {
                        name: "🎮 **__Matériel :__**", value: config.materials
                    }
                ])
                .setTimestamp()

            console.log("=========");
            logger.event(`Nouvelle LAN : ${lanName} (${lan.id}) /// Serveur : ${interaction.guild.name} (${interaction.guildId})`);
            console.log("=========");
            
            const btnGoogleAgenda = new ButtonBuilder()
                .setLabel("Rappel Google Agenda")
                .setStyle(ButtonStyle.Link)
                .setURL(lan.getAgendaLink())
            
            const message = `## Inscription pour la ${lan.name}\n\n> 👉 Clique sur le bouton ci-dessous pour réserver ta place et rejoindre l'aventure !`
            const participantsEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription("## Liste des participants :")

            let attachmentParticipants = null;

            if (data.participants.length > 0) {
                const participantsImage = await lan.generateParticipantsImage(interaction.guild, 64);

                attachmentParticipants = new AttachmentBuilder()
                    .setFile(participantsImage)
                    .setName(`${lan.id}_participants.png`);

                participantsEmbed.setImage(`attachment://${attachmentParticipants.name}`);
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
            
            const managementButton = new ButtonBuilder()
                .setCustomId("lan-management-btn")
                .setLabel("Gestion de la LAN")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🪛")
            
            const deleteLanButton = new ButtonBuilder()
                .setCustomId("delete-lan-btn")
                .setLabel("Supprimer la LAN")
                .setStyle(ButtonStyle.Danger)
                .setEmoji("<:trash:1378419101751447582>")

            await generalChannel.setTopic(lan.id.toString());
            await generalChannel.send({ 
                content: message, 
                embeds: [participantsEmbed], 
                components: [new ActionRowBuilder().addComponents(participantsButton, removeParticipantsButton)], 
                files: attachmentParticipants ? [attachmentParticipants] : []
            });

            const textDisplay = new TextDisplayBuilder(
                { content: `## ⚙️ Gestion de la LAN ${lan.name}\n\nCe salon est réservé à l'organisation de la LAN. C'est ici que tu pourras supprimer la LAN, modifier les informations, gérer la liste des participants, les accès aux salons, etc...` }
            )

            const imageGestion = new AttachmentBuilder().setFile(readFileSync("./config/gestion_icon.png")).setName("gestion.png");
            
            const mediaGallery = new MediaGalleryBuilder()
                .addItems([
                    {
                        media: {
                            url: `attachment://gestion.png`
                        }
                    }
                ])
            
            const container = new ContainerBuilder()
                .addMediaGalleryComponents(mediaGallery)
                .addTextDisplayComponents(textDisplay)
                .addActionRowComponents(new ActionRowBuilder().addComponents(managementButton, deleteLanButton))

            const thread = await generalChannel.threads.create({
                name: "⚙️ Gestion",
                invitable: false,
                type: ChannelType.PrivateThread,
            })
            await thread.join();
            await thread.members.add(interaction.user.id);
            await thread.send({ components: [container], files:[imageGestion], flags: [MessageFlags.IsComponentsV2] });

            await informationChannel.send({ embeds: [informationEmbed], components: [ new ActionRowBuilder().addComponents(btnaddressMaps, btnaddressWaze), new ActionRowBuilder().addComponents(btnGoogleAgenda) ] })
            await informationChannel.send({ embeds: [logistiqueEmbed], components: googleSheetButton ? [new ActionRowBuilder().addComponents(googleSheetButton)] : [] })

            await client.lans.set(lan.id, lan);

            
            interaction.editReply({content: `✅ **${lan.name}** a bien été créée !` });
        } catch (error) {
            console.error(error)
            interaction.editReply({ content: "❌ Une erreur est arrivé !\n\n" + error });
        }
    }
}