const { ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { color } = require('../../../../config/config.json');
const { Match } = require('../../../class/Match');

module.exports = {
    data: {
        name: "select-match",
        multi: "select-suppr-match"
    },
    async execute(interaction, client) {
        const info = interaction.values[0];

        const { tournaments } = client;
        const messageId = interaction.message.content.split("\n").map(line => {
            const m = line.match(/\b\d{18,20}\b/);
            if (m) {
                return m[0];
            }
        }).filter(line => line != null)[0];

        const message = await client.channels.cache.get(interaction.channelId).messages.fetch(messageId);
        
        const embedStats = message.embeds[0].data;
        
        const tournament = tournaments.get(embedStats.footer.text.split('ID : ')[1]);
        /**
         * @type Match
         */
        const match = tournament.matches.find(match => match.id === info);
        
        if (interaction.customId == "select-suppr-match") {
            tournament.matches = tournament.matches.filter(match => match.id != info);
            match.delete(tournament);
            
            embedStats.fields = embedStats.fields.map(field => {
                if (field.name === '**Nombre de match(s)**') {
                  return {
                    ...field,
                    value: `> ${tournament.matches.length}`
                  };
                }
                return field;
            });

            const embedStatsEdited = new EmbedBuilder(embedStats);
            await message.edit({ embeds: [ embedStatsEdited ]});
            const messageContent = `# Espace de suppression des Matchs du tournois \`${tournament.name}\`\nCet espace est dédié a la suppression des Matchs d'un Tournois. Cette action est **définitive** ! Il faut faire attention !\n\n# Informations\n\`\`\`diff\n+ La suppression du match ${match.id} a bien été effectuée.\`\`\``;
            await interaction.update({ content: messageContent, components: [] });
        }
        else {
            const embedMatch = new EmbedBuilder()
                .setColor(color.green)
                .setDescription(`# Score : ${match.score1} - ${match.score2}`)
                .setFooter({ text: `ID : ${match.id} `})
            
            match.mapName ? embedMatch.addFields({ name: "**Map**", value: `> 🗺️ ${match.mapName}`, inline: false }) : null;

            let i = 0;
            const guild = interaction.guild;
            tournament.teams.forEach(team => {
                let teamDisplay = "";
                team.players.forEach(player => {
                    teamDisplay += `- <@${guild.members.cache.find(m => player.name == m.displayName).user.id}>\n${match.playerStats[player.id].kills}/${match.playerStats[player.id].deaths}\n\n`
                })
                embedMatch.addFields({
                    name: `${i >= 1 ? "\u200B" : "**Équipes**"}`, value: `> ${team.name}\n${teamDisplay}`, inline: true
                })
                i++;
            })
            
            const scoreMatchBtn = new ButtonBuilder()
                .setCustomId("score-match-btn")
                .setLabel("Saisir score du match")
                .setEmoji("📝")
                .setStyle(ButtonStyle.Secondary)

            const saveMatchScoreBtn = new ButtonBuilder()
                .setCustomId("save-match-score-btn")
                .setLabel("Sauvegarder")
                .setEmoji("💾")
                .setStyle(ButtonStyle.Success)

            let teamsSelectmenus = [new ActionRowBuilder().addComponents(scoreMatchBtn, saveMatchScoreBtn)];
            let index = 0;
            tournament.teams.forEach((team) => {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId("select-change-stats"+(index + 1)) // faire ça
                    .setPlaceholder(team.name)
                    .setMinValues(1)
                    .setMaxValues(1)
                index++;
                
                team.players.forEach(p => {
                    selectMenu.addOptions(new StringSelectMenuOptionBuilder({
                        label: p.name,
                        value: `${p.name};${team.name}`
                    }))
                })
                teamsSelectmenus.push(new ActionRowBuilder().addComponents(selectMenu));
            });

            const messageContent = `# Espace de modification des statistiques des Matchs du tournois \`${tournament.name}\`\n-# Message ID : ${interaction.message.id}\nCet espace est dédié a la modification des statitiques des joueurs durant les Matchs d'un Tournois. Les statistiques seront modifier en temps réel et consultable par tous les joueurs soit par commande, soit dans les salons vocaux de leur équipe.\n\n# Informations\n* **Sélectionne** le joueur de l'équipe dont vous souhaitez modifier les statistiques.\n* Pour **saisir** le score du match, il suffit de cliquer le bouton \`Saisir score du match\`.\n* Pour **sauvegarder** les statistiques du match et le sauvegarder, tu peux cliquer sur le bouton \`Sauvegarder\`.`;
            await interaction.update({ content: messageContent, embeds: [embedMatch], components: teamsSelectmenus })
        }
    }
}