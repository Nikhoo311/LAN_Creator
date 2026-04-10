const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags,  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder } = require("discord.js");
const { color } = require('../../../../config/config.json');
const { getGoogleMapsLink } = require("../../../functions/utils/getLinkAddress.js");
const { Lan } = require("../../../class/Lan.js")
const logger = require("../../../functions/utils/Logger.js");
const { decrypt } = require("../../../functions/utils/crypt.js");
const { getGuildConfig } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "lan_create"
    },
    async execute(interaction, client) {
        const nameLAN = interaction.fields.getTextInputValue("lan_name");
        const configId = interaction.fields.getStringSelectValues("lan_config_name")[0];
        const config = getGuildConfig(client, configId, interaction.guildId);
        if (!config) {
            return await interaction.reply({ content: "❌ Configuration introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const nbVocaux = Number(interaction.fields.getTextInputValue("lan_nb_voc")) || 1;
        const fileImage = interaction.fields.getUploadedFiles("file_flyer_image", false)?.first() || null;
        const lanOptions = interaction.fields.getCheckboxGroup("lan_options") || [];
        const guild = interaction.guild;

        if (fileImage?.contentType && !["image/png", "image/jpg", "image/jpeg", "image/gif"].includes(fileImage.contentType)) {
            return await interaction.reply({ content: `❌ Le type de fichier \`${fileImage.name.split(".").pop()}\` n'est pas prit en compte`, flags: [MessageFlags.Ephemeral] });
        }

        if (nbVocaux > 5 || nbVocaux < 1) {
            return interaction.reply({content: "❌ Veuillez saisir un nombre entre 1 et 5", flags: [MessageFlags.Ephemeral] })
        }
        
        if (lanOptions.length >= 1) {
            let components = [];
            const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);
            const firstText = new TextDisplayBuilder({ 
                content: `## Récapitulatif :\n**Nom de la LAN :** ${nameLAN}\n\n**Configuration utiliser :** 🏠 ${config.name} (${configId})\n\n**Liste des salons :**\n${config.channels.filter(ch => ch.active).map(c => `* <:channel:1440082251366010983> ${c.name}`).join("\n")}\n + ${nbVocaux} salon${nbVocaux > 1 ? "s" : ""} ${nbVocaux > 1 ? "vocaux" : "vocal"}`
            })
            const recapContainer = new ContainerBuilder()
                .setAccentColor(parseInt(color.white.replace("#", ""), 16))
                .addTextDisplayComponents(firstText)
                .addSeparatorComponents(separator)
            
            if (fileImage) {
                const mediaConxtainerImageLan = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(fileImage.url))

                const imageContainer = new ContainerBuilder()
                    .setAccentColor(parseInt(color.white.replace('#', ''), 16))
                    .addMediaGalleryComponents(mediaConxtainerImageLan)
                components.push(imageContainer)
            }

            const lanAllOptionsArray = [
                { label: '🎮 Ajouter une liste de participants prédéfinie', value: 'add_default_participants_list' },
                { label: '📅 Définir la date de la LAN', value: 'set_lan_date-btn' },
                { label: '🗒️ Connecter une feuille Google Sheets', value: 'add_google_sheet-btn' },
            ];

            const secondText = new TextDisplayBuilder({ content: `${lanOptions.map(id => {
                const data = lanAllOptionsArray.find(opt => opt.value === id)
                return `* ❌    ${data.label}`
            }).join('\n')}` })

            const editRecapBtn = new ButtonBuilder()
                .setCustomId("edit-recap-btn")
                .setEmoji("📝")
                .setLabel("Remplir les informations")
                .setStyle(ButtonStyle.Secondary)
            
            const thirdText = new TextDisplayBuilder({ content: `Il faut remplir les informations optionnelles de la LAN en cliquant sur le bouton \`Remplir les informations\` et pour pouvoir la créer. Une fois les informations optionnelles remplies et approuvé avec le bouton \`Créer ${nameLAN}\`, aucune modifications supplémentaire sera possible.\n\nSi vous voulez modifier remodifier ces informations, il faudra recommencer le processus de création de LAN.` });

            const createLanBtn = new ButtonBuilder()
                .setCustomId("create-lan-with-recap-btn")
                .setLabel(`Créer ${nameLAN}`)
                .setEmoji("➕")
                .setStyle(ButtonStyle.Success)

            recapContainer.addTextDisplayComponents(secondText).addSeparatorComponents(separator).addTextDisplayComponents(thirdText).addActionRowComponents([new ActionRowBuilder().addComponents(editRecapBtn, createLanBtn)])
            components.push(recapContainer);

            client.placeholder.set(`${interaction.applicationId}-${interaction.guildId}`,
                {
                    lanOptions,
                    haveLanFlyer: !!fileImage,
                }    
            );

            return await interaction.reply({
                components,
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
            });
        }
        
        try {
            await interaction.deferReply({
                withResponse: true,
                flags: [MessageFlags.Ephemeral]
            });
            const category = await guild.channels.create({
                name: `${nameLAN}`,
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
            if (fileImage) {
                await generalChannel.send({ files: [fileImage] });
            }

            const informationChannel = guild.channels.cache.get(channels.find(ch => ch.name == "informations").channelId);

            let vcChannels = []

            for (let index = 0; index < nbVocaux; index++) {
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
    
            const informationEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription(`🔍 **__Informations :__**\nVoici toutes les infomations principales pour **${nameLAN}**`)
                .addFields([
                    {
                        name: "📌 **__Lieu :__**", value: decrypt(config.address, process.env.TOKEN), inline: true
                    },
                    {
                        name: "🧭 **__Horaire :__**", value: config.hours , inline: true
                    },
                    {
                        name: "🎮 **__Matériel :__**", value: config.materials
                    }
                ])
                .setTimestamp()
            const logistiqueEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription("> Demander à l'hôte les informations pour la logistique")
                .setTimestamp()
            
            const btnaddress = new ButtonBuilder()
                .setLabel("Adresse Google Maps")
                .setStyle(ButtonStyle.Link)
                .setURL(getGoogleMapsLink(decrypt(config.address, process.env.TOKEN)))
            
            // Creation d'un objet LAN
            const channelsArray = [...channels, ...vcChannels];

            const obj = await Lan.model.create({
                guildId: interaction.guildId,
                name: nameLAN,
                config: config._id,
                channels: channelsArray,
                startedAt: new Date(),
                endedAt: null,
            })
            const startedSec = Math.floor(new Date(obj.startedAt).getTime() / 1000);
            const lan = new Lan(nameLAN, channelsArray, config, [], obj._id.toString(), startedSec, null, interaction.guildId)

            console.log("=========");
            logger.event(`Nouvelle LAN : ${nameLAN} (${lan.id}) /// Serveur : ${interaction.guild.name} (${interaction.guildId})`);
            console.log("=========");
            
            const btnGoogleAgenda = new ButtonBuilder()
                .setLabel("Rappel Google Agenda")
                .setStyle(ButtonStyle.Link)
                .setURL(lan.getAgendaLink())
            
            const message = `## Inscription pour la ${lan.name}\n\n> 👉 Clique sur le bouton ci-dessous pour réserver ta place et rejoindre l'aventure !`
            const participantsEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription("## Liste des participants :")

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

            await generalChannel.setTopic(lan.id.toString());
            await generalChannel.send({ content: message, embeds: [participantsEmbed], components: [new ActionRowBuilder().addComponents(participantsButton, removeParticipantsButton)] });

            await informationChannel.send({ embeds: [informationEmbed], components: [ new ActionRowBuilder().addComponents(btnaddress).addComponents(btnGoogleAgenda) ] })
            await informationChannel.send({ embeds: [logistiqueEmbed] })
            
            // Ajout dans une collection (a voir comment faire pour avoir les données persistantes)
            await client.lans.set(lan.id, lan)
            
            interaction.editReply({content: `✅ **${nameLAN}** a bien été créée !` });
        } catch (error) {
            console.error(error)
            interaction.editReply({ content: "❌ Une erreur est arrivé !\n\n" + error });
        }
    }
}