const { ActionRowBuilder, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: {
        name: "set-tournament-name-btn"
    },
    async execute (interaction, client) {
        const infoPannelMessage = await client.channels.cache.get(interaction.channel.id).messages.fetch(interaction.message.id);
        
        await interaction.reply({ content: "Saisir un nom pour le tournois...\n⚠️ **Temps maximum 1min**", flags: [MessageFlags.Ephemeral] })
        const collector = interaction.channel.createMessageCollector({
            filter: (msg) => !msg.author.bot && msg.author.id === interaction.user.id,
            time: 60_000,
            max: 1
        })

        collector.on('collect', async (message) => {
            const needToUpdateEmbed = new EmbedBuilder(infoPannelMessage.embeds[0].data)
                .spliceFields(0, 1, {
                    name: "**Nom du tournois**", value: `> ${message.content}`, inline: true
                })
            
            const updateTournamentNameBtn = new ButtonBuilder(infoPannelMessage.components[1].components[0].data)
                .setStyle(ButtonStyle.Secondary)
            const addTeamBtn = new ButtonBuilder(infoPannelMessage.components[1].components[1].data)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false)
            
            const ActionRowOne = infoPannelMessage.components[0];

            infoPannelMessage.edit({ embeds: [needToUpdateEmbed], components: [ActionRowOne, new ActionRowBuilder().addComponents(updateTournamentNameBtn).addComponents(addTeamBtn)] })
            await interaction.editReply({ content: `✅ Nom du tournoi défini : \`${message.content}\`` });
            message.delete();
        });
    
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({ content: "⏰ Temps écoulé. Aucun nom saisi pour le tournoi." });
            }
        });
    }
}