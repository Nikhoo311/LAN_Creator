const { MessageFlags, ButtonBuilder, ButtonStyle, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ActionRowBuilder, ContainerBuilder } = require("discord.js");
const { getGuildConfig } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "lan_edit_recap"
    },
    async execute(interaction, client) {
        try {
            const { lanOptions, haveLanFlyer } = client.placeholder.get(`${interaction.applicationId}-${interaction.guildId}`);
            const fieldsValues = {};

            const recapContainer = interaction.message.components[haveLanFlyer ? 1 : 0];

            // get config
            const match = recapContainer.components[0].content.split("\n\n")[1].match(/\(([^)]+)\)/);
            const id = match ? match[1] : null;
            const config = getGuildConfig(client, id, interaction.guildId);

            const container = new ContainerBuilder()
                .setAccentColor(recapContainer.data.accent_color)
            const separator = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large);

            for (const option of lanOptions) {
                switch (option) {
                    case "set_lan_date-btn": {
                        const startInput = interaction.fields.getTextInputValue("lan_start_date"); // Ex : "03/02/2026"
                        const endInput = interaction.fields.getTextInputValue("lan_end_date"); // Ex : "06/02/2026"

                        const [startDay, startMonth, startYear] = startInput.split("/").map(Number);
                        const [endDay, endMonth, endYear] = endInput.split("/").map(Number);

                        const [hour, minute] = config.hours.split('h').map(Number);

                        fieldsValues.startDate = new Date(startYear, startMonth - 1, startDay, hour, minute);
                        fieldsValues.endDate = new Date(endYear, endMonth - 1, endDay, hour, minute);
                        break;
                    }

                    case "add_default_participants_list":
                        fieldsValues.participants = interaction.fields.getSelectedUsers("lan_participants").map(user => user.id);
                        break;

                    case "add_google_sheet-btn":
                        const link = interaction.fields.getTextInputValue("lan_google_sheet_link");

                        if (link && !(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+\/?/.test(link))) {
                            return interaction.reply({content: "❌ Veuillez saisir un lien Google Sheet correct !", flags: [MessageFlags.Ephemeral]})
                        }

                        fieldsValues.googleSheetLink = new ButtonBuilder()
                            .setLabel("Google Sheet")
                            .setStyle(ButtonStyle.Link)
                            .setURL(`${link}`)
                        break;

                    default:
                        break;
                }
            }


            const firstText = new TextDisplayBuilder({ content: recapContainer.components[0].content});

            let content = firstText.data.content;

            // ================= DATE =================
            if (lanOptions.includes("set_lan_date-btn")) {
                const newDateBlock = `**Date de début :** <t:${Math.floor(fieldsValues.startDate.getTime() / 1000)}:D>\n**Date de fin :** <t:${Math.floor(fieldsValues.endDate.getTime() / 1000)}:D>`;

                const dateRegex = /\*\*Date de début :\*\*[\s\S]*?\*\*Date de fin :\*\*.*?(?=\n\n|$)/;

                if (dateRegex.test(content)) {
                    content = content.replace(dateRegex, newDateBlock);
                } else {
                    content += `\n\n${newDateBlock}`;
                }
            }

            // ================= PARTICIPANTS =================
            if (lanOptions.includes("add_default_participants_list")) {
                const participantsList = fieldsValues?.participants?.length
                    ? fieldsValues.participants.map(id => `* <@${id}>`).join("\n")
                    : "Aucune";

                const newParticipantsBlock = `**Liste des participants :**\n${participantsList}`;

                const participantsRegex = /\*\*Liste des participants :\*\*[\s\S]*?(?=\n\n|$)/;

                if (participantsRegex.test(content)) {
                    content = content.replace(participantsRegex, newParticipantsBlock);
                } else {
                    content += `\n\n${newParticipantsBlock}`;
                }
            }

            // Update final
            firstText.setContent(content);

            const secondText = new TextDisplayBuilder({ content: recapContainer.components[2].content.replaceAll("❌", "✅") })
            const thirdText = new TextDisplayBuilder({ content: recapContainer.components[4].content })

            container.addTextDisplayComponents(firstText)
            container.addSeparatorComponents(separator)
            container.addTextDisplayComponents(secondText)
            container.addSeparatorComponents(separator)
            container.addTextDisplayComponents(thirdText)

            const actionRow = ActionRowBuilder.from(recapContainer.components[5]);

            if (lanOptions.includes("add_google_sheet-btn")) {
                actionRow.setComponents(
                    ...actionRow.components.filter(c => c.data?.style !== ButtonStyle.Link),
                    fieldsValues.googleSheetLink
                ); 
            }
            container.addActionRowComponents(actionRow)
            return await interaction.update({ components: haveLanFlyer ? [interaction.message.components[0], container] : [container] })

        } catch (error) {
            console.error(error);
            return await interaction.reply({
                content: "❌ Une erreur est survenue lors de la récupération des informations du modal.",
                flags: [MessageFlags.Ephemeral]
            });
        }
    }
};