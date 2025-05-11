const { ActionRowBuilder, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "add-teams-tournament-btn"
    },
    async execute (interaction, client) {
        const infoPannelMessage = await client.channels.cache.get(interaction.channel.id).messages.fetch(interaction.message.id);
        let selectTeams = infoPannelMessage.components.length == 2 ? infoPannelMessage.components : infoPannelMessage.components.slice(0,2);
        
        infoPannelMessage.edit({ components: selectTeams })
        await interaction.reply({ content: "Saisir le nom de la permière équipe...\n⚠️ **Temps maximum 1min**", flags: [MessageFlags.Ephemeral] })
        const teamOneCollector = interaction.channel.createMessageCollector({
            filter: (msg) => (!msg.author.bot && msg.author.id === interaction.user.id) && msg.content.length <= 130,
            time: 60_000,
            max: 1
        })

        teamOneCollector.on('collect', async (message) => {
            const needToUpdateEmbed = new EmbedBuilder(infoPannelMessage.embeds[0].data)
                .spliceFields(3, 1, {
                    name: "**Équipes**", value: `> ${message.content}`, inline: true
                })

            infoPannelMessage.edit({ embeds: [needToUpdateEmbed], components: [...infoPannelMessage.components] })
            
            message.delete();

            await interaction.editReply({ content: "Saisir le nom de la deuxième équipe...\n⚠️ **Temps maximum 1min**", flags: [MessageFlags.Ephemeral] })
            const teamTwoCollector = interaction.channel.createMessageCollector({
                filter: (msg) => (!msg.author.bot && msg.author.id === interaction.user.id) && msg.content.length <= 130,
                time: 60_000,
                max: 1
            })

            teamTwoCollector.on('collect', async (message) => {
                const needToUpdateEmbed = new EmbedBuilder(infoPannelMessage.embeds[0].data)
                
                if (needToUpdateEmbed.data.fields < 4) {
                    needToUpdateEmbed.addFields(
                        { name: '\u200B', value: `> ${message.content}`, inline: true },
                    )
                } else {
                    needToUpdateEmbed.spliceFields(4, 1,
                        { name: '\u200B', value: `> ${message.content}`, inline: true },
                    )
                }

                infoPannelMessage.edit({ embeds: [needToUpdateEmbed], components: [...infoPannelMessage.components]})
                message.delete();
                await interaction.editReply({ content: "Saisir le nombre de joueurs par équipe...\n⚠️ **Temps maximum 30s**", flags: [MessageFlags.Ephemeral] })
                // Saisir le nom de joueur par équipe
                const playerPerTeam = interaction.channel.createMessageCollector({
                    filter: (msg) => (!msg.author.bot && msg.author.id === interaction.user.id) && (Number(msg.content) && Number(msg.content) <= 25),
                    time: 30_000,
                    max: 1
                })

                playerPerTeam.on('collect', async (message) => {
                    let maxPlayersPerTeam = Number(message.content);
                    const teamsNames = infoPannelMessage.embeds[0].fields.slice(3).map(field => field.value.split("> ")[1])
                    
                    message.delete();
                    const teamOneSelect = new UserSelectMenuBuilder()
                    .setCustomId('select-add-players-to-team')
                    .setMinValues(1)
                    .setMaxValues(maxPlayersPerTeam)
                    .setPlaceholder(`Joueurs de l'équipe ${teamsNames[0]}`)
                    
                    const teamTwoSelect = new UserSelectMenuBuilder()
                    .setCustomId('select-add-players-to-team2')
                    .setMinValues(1)
                    .setMaxValues(maxPlayersPerTeam)
                    .setPlaceholder(`Joueurs de l'équipe ${teamsNames[1]}`)
                    
                    infoPannelMessage.edit({components: [
                        ...infoPannelMessage.components,
                        new ActionRowBuilder().addComponents(teamOneSelect),
                        new ActionRowBuilder().addComponents(teamTwoSelect)
                    ]})
                    await interaction.editReply({ content: `✅ Le nombre de joueur${maxPlayersPerTeam > 1 ? "s" : ""} par équipe est à \`${maxPlayersPerTeam}\``});
                });
            
                playerPerTeam.on('end', async (collected) => {
                    if (collected.size === 0) {
                        await interaction.editReply({ content: "⏰ Temps écoulé. Aucun nombre de joueur(s) max par équipe saisi.." });
                    }
                });
            });
            
            teamTwoCollector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.editReply({ content: "⏰ Temps écoulé. Aucun nom saisi pour l'équipe 2." });
                }
            });
        });
    
        teamOneCollector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({ content: "⏰ Temps écoulé. Aucun nom saisi pour l'équipe 1." });
            }
        });
        
    }
}