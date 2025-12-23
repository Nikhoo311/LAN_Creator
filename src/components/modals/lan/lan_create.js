const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags, AttachmentBuilder } = require("discord.js");
const { color } = require('../../../../config/config.json');
const { getGoogleMapsLink } = require("../../../functions/utils/getLinkaddress.js");
const { Lan } = require("../../../class/Lan.js")
const LanModel = require("../../../schemas/lan.js");
const { decrypt } = require("../../../functions/utils/crypt.js");

module.exports = {
    data: {
        name: "lan_create"
    },
    async execute(interaction, client) {
        const nameLAN = interaction.fields.getTextInputValue("lan_name");
        const config = client.configs.get(interaction.fields.getStringSelectValues("lan_config_name")[0]);
        const googlesheetLink = interaction.fields.getTextInputValue('lan_google_sheet') || null;
        const nbVocaux = Number(interaction.fields.getTextInputValue("lan_nb_voc")) || 1;
        const fileImage = interaction.fields.getUploadedFiles("file_flyer_image", false)?.first() || null;
        const guild = interaction.guild;

        if (fileImage?.contentType && !["image/png", "image/jpg", "image/jpeg", "image/gif"].includes(fileImage.contentType)) {
            return await interaction.reply({ content: `❌ Le type de fichier \`${fileImage.name.split(".").pop()}\` n'est pas prit en compte`, flags: [MessageFlags.Ephemeral] });
        }

        if (nbVocaux > 5 || nbVocaux < 1) {
            return interaction.reply({content: "❌ Veuillez saisir un nombre entre 1 et 5", flags: [MessageFlags.Ephemeral] })
        }
        
        if (googlesheetLink && !(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+\/?/.test(googlesheetLink))) {
            return interaction.reply({content: "❌ Veuillez saisir un lien Google Sheet correct !", flags: [MessageFlags.Ephemeral]})
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
            if (fileImage) {
                const generalChannel = guild.channels.cache.get(channels.find(ch => ch.name == "général").channelId);
                generalChannel.send({ files: [fileImage] });
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
            const descriptionEmbed = googlesheetLink ? `Lien du Google Sheet : [Cliquez ici](${googlesheetLink})` : "> Demander à l'hôte les informations pour la logistique"
            const logistiqueEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription(descriptionEmbed)
                .setTimestamp()
            
            const btnaddress = new ButtonBuilder()
                .setLabel("Adresse Google Maps")
                .setStyle(ButtonStyle.Link)
                .setURL(getGoogleMapsLink(decrypt(config.address, process.env.TOKEN)))

            const btnGoogleSheet = googlesheetLink ? new ButtonBuilder()
                .setLabel("Google Sheet")
                .setStyle(ButtonStyle.Link)
                .setURL(`${googlesheetLink}`)
                : null;
            
            // Creation d'un objet LAN
            const channelsArray = [...channels, ...vcChannels];

            const obj = await Lan.model.create({
                name: nameLAN,
                config: config._id,
                channels: channelsArray,
                startedAt: new Date(),
                endedAt: null,
            })
            const lan = new Lan(nameLAN, channelsArray, config, Math.floor(obj.startedAt / 1000), null, obj._id)
            const btnGoogleAgenda = new ButtonBuilder()
                .setLabel("Rappel Google Agenda")
                .setStyle(ButtonStyle.Link)
                .setURL(lan.getAgendaLink())

            informationChannel.send({ embeds: [informationEmbed], components: [ new ActionRowBuilder().addComponents(btnaddress).addComponents(btnGoogleAgenda) ] })
            informationChannel.send({ embeds: [logistiqueEmbed], components: googlesheetLink ? [ new ActionRowBuilder().addComponents(btnGoogleSheet) ] : [] })
            
            // Ajout dans une collection (a voir comment faire pour avoir les données persistantes)
            await client.lans.set(lan.id, lan)
            
            interaction.editReply({content: `✅ **${nameLAN}** a bien été créée !`, flags: [MessageFlags.Ephemeral]})
        } catch (error) {
            console.error(error)
            interaction.editReply({ content: "❌ Une erreur est arrivé !\n\n" + error, flags: [MessageFlags.Ephemeral] })
        }
    }
}