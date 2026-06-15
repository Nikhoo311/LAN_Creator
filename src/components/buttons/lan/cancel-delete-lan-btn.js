const { MessageFlags, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle, ContainerBuilder } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "cancel-delete-lan-btn"
    },
    async execute (interaction, client) {
        const generalChannel = interaction.channel?.parent;
        const lanId = generalChannel?.topic;
        
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const text = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n- Annulation de la suppression de la LAN \`${lan.name}\`.\`\`\`` });
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)
        return await interaction.update({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }
}