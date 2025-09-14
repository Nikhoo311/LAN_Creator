const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags } = require("discord.js");
const { color } = require('../../../../config/config.json');
const { readFileSync } = require("fs");
const { getGoogleMapsLink } = require("../../../functions/utils/getLinkAdress.js");
const { Lan } = require("../../../class/Lan.js")
module.exports = {
    data: {
        name: "lan_create"
    },
    async execute(interaction, client) {
        const nameLAN = interaction.fields.getTextInputValue("lan_name")
        const googlesheetLink = interaction.fields.getTextInputValue('lan_google_sheet') || null;
        const nbVocaux = Number(interaction.fields.getTextInputValue("lan_nb_voc")) || 1
        const guild = interaction.guild;
        
        const file = JSON.parse(readFileSync("./config/bd.json", "utf-8"));
        const configFile = JSON.parse(readFileSync("./config/choose-config.json", "utf-8"));
        
        function getInfoConfig(name) {
            let result;
            file["bd"].forEach(element => {
                if (element.name == name) {
                    result = element
                }
            });
            return result;
        }

        const configChosen = getInfoConfig(configFile["config_chosen"])
        
        if (nbVocaux > 5 || nbVocaux < 1) {
            return interaction.reply({content: "❌ Veuillez saisir un nombre entre 1 et 5", flags: [MessageFlags.Ephemeral] })
        }
        
        if (googlesheetLink && !(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+\/?/.test(googlesheetLink))) {
            return interaction.reply({content: "❌ Veuillez saisir un lien Google Sheet correct !", flags: [MessageFlags.Ephemeral]})
        }
        
        try {
            await interaction.deferReply({
                fetchReply: true,
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

            const general = await guild.channels.create({
                name: `général`,
                type: ChannelType.GuildText,
                parent: category.id
            })
            
            const picture = await guild.channels.create({
                name: `photos`,
                type: ChannelType.GuildText,
                parent: category.id
            })
    
            const informationChannel = await guild.channels.create({
                name: `informations`,
                type: ChannelType.GuildText,
                parent: category.id
            })

            const logistiqueChannel = await guild.channels.create({
                name: `logistique`,
                type: ChannelType.GuildText,
                parent: category.id
            })
            
            let vcChannels = []

            for (let index = 0; index < nbVocaux; index++) {
                let vcChannel = await guild.channels.create({
                    name: `🔊 Vocal ${index + 1}`,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                })

                vcChannels.push(vcChannel.id);
            }
    
            const informationEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription(`🔍 **__Informations :__**\nVoici toutes les infomations principales pour la **${nameLAN}**`)
                .addFields([
                    {
                        name: "📌 **__Lieu :__**", value: configChosen.adress, inline: true
                    },
                    {
                        name: "🧭 **__Horaire :__**", value: configChosen.hours , inline: true
                    },
                    {
                        name: "🎮 **__Matériel :__**", value: configChosen.materials
                    }
                ])
                .setTimestamp()
            const descriptionEmbed = googlesheetLink ? `Lien du Google Sheet : [Cliquez ici](${googlesheetLink})` : "> Demander à l'hôte les informations pour la logistique"
            const logistiqueEmbed = new EmbedBuilder()
                .setColor(color.red)
                .setDescription(descriptionEmbed)
                .setTimestamp()
            
            const btnAdress = new ButtonBuilder()
                .setLabel("Adresse Google Maps")
                .setStyle(ButtonStyle.Link)
                .setURL(getGoogleMapsLink(configChosen.adress))

            const btnGoogleSheet = googlesheetLink ? new ButtonBuilder()
                .setLabel("Google Sheet")
                .setStyle(ButtonStyle.Link)
                .setURL(`${googlesheetLink}`)
                : null;
            
            // Creation d'un objet LAN
            let channelsObject = {category: category.id, general: general.id, information: informationChannel.id, picture: picture.id, logistique: logistiqueChannel.id, voice: vcChannels}
            const lan = new Lan(nameLAN, channelsObject, configChosen)

            const btnGoogleAgenda = new ButtonBuilder()
                .setLabel("Rappel Google Agenda")
                .setStyle(ButtonStyle.Link)
                .setURL(lan.getAgendaLink())

            informationChannel.send({ embeds: [informationEmbed], components: [ new ActionRowBuilder().addComponents(btnAdress).addComponents(btnGoogleAgenda) ] }).then(msg => msg.pin())
            logistiqueChannel.send({ embeds: [logistiqueEmbed], components: googlesheetLink ? [ new ActionRowBuilder().addComponents(btnGoogleSheet) ] : [] }).then(msg => msg.pin())
            
            // Ajout dans une collection (a voir comment faire pour avoir les données persistantes)
            await client.lans.set(lan.id, lan)
            
            interaction.editReply({content: `✅ **${nameLAN}** a bien été créée !`, flags: [MessageFlags.Ephemeral]})
            lan.save()
        } catch (error) {
            interaction.editReply({ content: "❌ Une erreur est arrivé !\n\n" + error, flags: [MessageFlags.Ephemeral] })
        }
    }
}