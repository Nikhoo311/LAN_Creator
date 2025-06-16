const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');
const dayjs = require('dayjs');

module.exports = {
    data: {
        name: "management-match-btn"
    },
    async execute(interaction, client) {
        await interaction.deferReply()
        const { tournaments } = client;

        const embedStats = interaction.message.embeds[0].data;
        
        const tournament = tournaments.get(embedStats.footer.text.split('ID : ')[1]);
        if (tournament.matches.length == 0) {
            return await interaction.editReply({ content: `❌ Tu n'as encore aucun match sur ${tournament.name}... Pour avoir accès à cette partie, il faut créer un match.`, flags: [MessageFlags.Ephemeral] })
        }
        const selectMatches = new StringSelectMenuBuilder()
            .setCustomId("select-match")
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
        const message = `# Espace de modification des statistiques des Matchs du tournois \`${tournament.name}\`\n-# Message ID : ${interaction.message.id}\nCet espace est dédié a la modification des statitiques des joueurs durant les Matchs d'un Tournois. Les statistiques seront modifier en temps réel et consultable par tous les joueurs soit par commande, soit dans les salons vocaux de leur équipe.\n\n# Informations\nSélection du Match a modifier.`;
        await interaction.editReply({ content: message, components: [new ActionRowBuilder().addComponents(selectMatches)] })
    }
}