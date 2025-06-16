const { MessageFlags, ComponentType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");

function resetCompontent(components) {
    // Reset StringSelectMenu after submit
    const newComponents = components.map(row => {
        const newRow = new ActionRowBuilder();

        row.components.forEach(component => {
            if (component.type === ComponentType.StringSelect) {
                const newSelect = new StringSelectMenuBuilder(component.toJSON());
                newSelect.setDefaultOptions?.([]);
                newRow.addComponents(newSelect);
            } else {
                newRow.addComponents(component);
            }
        });
        return newRow;
    });
    return newComponents;
}
module.exports = {
    data: {
        name: "change-player-stats-match"
    },
    async execute(interaction, client) {
        const { placeholder } = client;

        const numKills = interaction.fields.getTextInputValue("num_kills");
        const numDeaths = interaction.fields.getTextInputValue('num_deaths');

        if(isNaN(Number(numKills)) || isNaN(Number(numDeaths))) {
            const message = await interaction.channel.messages.fetch(interaction.message.id);
            await message.edit({ components: resetCompontent(message.components)})
            return await interaction.reply({ content: "❌ Erreur de saisie... Merci de saisir uniquement des nombres.", flags: [MessageFlags.Ephemeral] });
        }

        const playerName = placeholder.get(interaction.applicationId);
        const embedStats = interaction.message.embeds[0];
        const playerMemberId = await interaction.guild.members.cache.find(m => m.displayName === playerName).user.id;
        
        embedStats.data.fields = embedStats.data.fields.map(field => { 
            if (field.value.includes(`<@${playerMemberId}>`)) {
                const fieldArray = field.value.split('\n');
                
                const index = fieldArray.findIndex(line => line.includes(`<@${playerMemberId}>`));
                
                if (index !== -1 && index + 1 < fieldArray.length) {
                    fieldArray[index + 1] = `${numKills}/${numDeaths}`;
                } else { return; }

                const finalValue = fieldArray.join(`\n`)

                return {
                    ...field,
                    value: finalValue
                };
            }
            return field;
        });
        placeholder.delete(interaction.applicationId);

        const embedStatsEdited = new EmbedBuilder(embedStats.data);
        return await interaction.update({ embeds: [embedStatsEdited], components: resetCompontent(interaction.message.components) });
    }
}