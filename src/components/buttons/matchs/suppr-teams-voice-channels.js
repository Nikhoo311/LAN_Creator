const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Tournament } = require('../../../class/Tournament');
const logger = require('../../../functions/utils/Logger');

module.exports = {
    data: {
        name: "suppr-teams-voice-channels"
    },
    async execute(interaction, client) {
        await interaction.deferUpdate();
        const { tournaments } = client;
        const tournamentId = interaction.message.embeds[0].footer.text.split("ID : ")[1];

        /**
         * @type Tournament
         */
        const tournament = tournaments.get(tournamentId);

        for (let index = 0; index < tournament.teams.length; index++) {
            const team = tournament.teams[index];

            try {
                interaction.guild.channels.cache.get(team.voiceChannel)?.delete();
                team.setVoiceChannel();
                await team.registerVoiceChannel(tournament, "");
                tournament.teams[index] = team;
            } catch (error) {
                console.error(error);
                logger.error(error.message);
            }
        }

        const createVocalsChannelsBtn = new ButtonBuilder()
            .setCustomId("create-voices-channels-btn")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Créer les salons vocaux d'équipes")
            .setEmoji('<:voice_add:1379566685681618975>')
        
        interaction.editReply({ components: [interaction.message.components[0], new ActionRowBuilder().addComponents(createVocalsChannelsBtn)] });
    }

}