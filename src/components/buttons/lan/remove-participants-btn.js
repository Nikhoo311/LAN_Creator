const { MessageFlags, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "remove-participants-btn"
    },
    async execute (interaction, client) {
        const user = interaction.user;
        const lanId = interaction.channel.topic
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        if (!lan.participants.includes(user.id)) {
            return await interaction.reply({ content: `❌ Impossible tu ne participes pas à cette LAN.`, flags: [MessageFlags.Ephemeral] });
        }

        await lan.removeParticipants(user.id);
        const participantsImage = await lan.generateParticipantsImage(interaction.guild, 64);
        const attachment = new AttachmentBuilder().setFile(participantsImage).setName(`${lan.id}_participants.png`);
        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setImage(`attachment://${attachment.name}`)

        await interaction.update({ embeds: [embed], files: [attachment] });
    }
}