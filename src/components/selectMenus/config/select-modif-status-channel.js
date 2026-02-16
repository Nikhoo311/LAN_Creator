const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: {
        name: "select-modif-status-channel-active",
        multi: "select-modif-status-channel-desactive"
    },
    async execute(interaction, client) {
        const channelsNames = interaction.values;

        const placeholder = client.placeholder.get(interaction.applicationId);
        let currentConfig = client.configs.get(placeholder);

        currentConfig.channels = currentConfig.channels.map(ch => {
            if (!channelsNames.includes(ch.name)) return ch;

            return {
                ...ch,
                active: interaction.customId === "select-modif-status-channel-active"
            };
        });
        client.configs.set(currentConfig.name, currentConfig);
        
        let rawConfigChannels = interaction.message.embeds[1].description.split("\n");
        channelsNames.forEach(chName => {
            // Trouver la ligne correspondant à ce channel
            const index = rawConfigChannels.findIndex(line => line.includes(chName));
        
            if (index === -1) return;
        
            let newLine = "";
        
            // Déterminer le nouvel emoji
            const newEmoji = interaction.customId === "select-modif-status-channel-active"
                ? "<:switch_enabled:1379563207760548022>"
                : "<:switch_disabled:1379563278681772144>";
        
            newLine = `### ${newEmoji} ${chName}`;
        
            rawConfigChannels[index] = newLine;

        });
        const updateEmbed = new EmbedBuilder(interaction.message.embeds[1].data)
            .setDescription(rawConfigChannels.join('\n'));

        return interaction.update({ embeds: [interaction.message.embeds[0], updateEmbed] })
    }
}