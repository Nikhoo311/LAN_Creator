const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

function createChannelSelectMenu({ customId, placeholder, channels }) {
    return new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setMinValues(1)
      .setMaxValues(channels.length)
      .setPlaceholder(placeholder)
      .setOptions(
        channels.map(ch => 
          new StringSelectMenuOptionBuilder()
            .setLabel(ch.name)
            .setValue(ch.name)
            .setEmoji("<:channel:1440082251366010983>")
        )
      );
}

module.exports = { createChannelSelectMenu }