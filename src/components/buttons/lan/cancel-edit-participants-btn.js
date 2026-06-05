const { MessageFlags, TextDisplayBuilder, ContainerBuilder } = require('discord.js');

module.exports = {
    data: {
        name: "cancel-edit-participants-btn"
    },
    async execute (interaction, client) {
        client.placeholder.delete(`edit_${lan.id}_participants`);
        const text = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n- Annulation de la modification de la liste des participants.\`\`\``} )
        
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)

        await interaction.update({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
    }
}