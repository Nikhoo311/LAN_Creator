const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');
const { Match } = require('../../../class/Match');
const dayjs = require('dayjs');

module.exports = {
    data: {
        name: "suppr-match-btn"
    },
    async execute(interaction, client) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] })
        const { tournaments } = client;

        const embedStats = interaction.message.embeds[0].data;
        
        const tournament = tournaments.get(embedStats.footer.text.split('ID : ')[1]);
        
        const selectMatches = new StringSelectMenuBuilder()
            .setCustomId("select-suppr-match")
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Choisir un Match")
        
        for (let index = 0; index < tournament.matches.length; index++) {
            const match = tournament.matches[index];
            const date = dayjs.unix(match.playedAt);

            selectMatches.addOptions(new StringSelectMenuOptionBuilder({
                label: `Match n°${index + 1}`,
                value: `${match.id}`,
                description: `Jouer le ${date.format("DD/MM/YYYY")} à ${date.format("HH:mm:ss")}`
            }))
        }
        const message = `# Espace de suppression des Matchs du tournois \`${tournament.name}\`\n-# Message ID : ${interaction.message.id}\nCet espace est dédié a la suppression des Matchs d'un Tournois. Cette action est **définitive** ! Il faut faire attention !\n\n# Informations\nSélection du Match a supprimer.`;
        await interaction.editReply({ content: message, components: [new ActionRowBuilder().addComponents(selectMatches)] })
    }
}