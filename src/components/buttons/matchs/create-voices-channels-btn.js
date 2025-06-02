const { ChannelType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { Tournament } = require('../../../class/Tournament');
const logger = require('../../../functions/utils/Logger');

module.exports = {
    data: {
        name: "create-voices-channels-btn"
    },
    async execute(interaction, client) {
        const { tournaments } = client;
        const tournamentId = interaction.message.embeds[0].footer.text.split("ID : ")[1];

        /**
         * @type Tournament
         */
        const tournament = tournaments.get(tournamentId);

        for (let index = 0; index < tournament.teams.length; index++) {
            const team = tournament.teams[index];
            const playersPerms = [];

            for (const player of team.players) {
                const member = interaction.guild.members.cache.find(p => p.displayName === player.name);
                if (!member) continue;

                playersPerms.push({
                    id: member.user.id,
                    allow: [
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.SendVoiceMessages,
                        PermissionFlagsBits.Speak,
                        PermissionFlagsBits.ViewChannel
                    ],
                });
            }

            try {
                const voiceChannel = await interaction.guild.channels.create({
                    name: `🎮 ${team.name}`,
                    type: ChannelType.GuildVoice,
                    parent: tournament.lan.channels.category,
                    userLimit: team.players.length,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone,
                            deny: [
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.UseSoundboard,
                                PermissionFlagsBits.UseEmbeddedActivities,
                                PermissionFlagsBits.CreateInstantInvite,
                                PermissionFlagsBits.MentionEveryone,
                                PermissionFlagsBits.SendTTSMessages,
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.DeafenMembers,
                                PermissionFlagsBits.MuteMembers,
                            ],
                        },
                        ...playersPerms
                    ],
                });

                team.setVoiceChannel(voiceChannel.id);
                team.registerVoiceChannel(tournament, voiceChannel.id);
                tournament.teams[index] = team;
            } catch (error) {
                console.error(error);
                logger.error(error.message);
            }
        }

        const supprTeamsVoiceChannels = new ButtonBuilder()
            .setCustomId("suppr-teams-voice-channels")
            .setLabel("Supprimer les salons vocaux d'équipes")
            .setEmoji("✖️")
            .setStyle(ButtonStyle.Danger)
        
        interaction.update({ components: [interaction.message.components[0], new ActionRowBuilder().addComponents(supprTeamsVoiceChannels)] });
    }

}