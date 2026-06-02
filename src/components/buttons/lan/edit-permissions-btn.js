const { MessageFlags, ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SeparatorBuilder, SeparatorSpacingSize, AttachmentBuilder, MediaGalleryBuilder } = require('discord.js');
const { readFileSync } = require('fs');
const { TEXT_PERMISSIONS, VOICE_PERMISSIONS } = require("../../../functions/utils/mapPermissions");

module.exports = {
    data: {
        name: "edit-permissions-btn"
    },
    async execute (interaction, client) {
        await interaction.deferUpdate();

        const category = interaction.channel?.parent.parent;
        const everyoneOverwrite = category?.permissionOverwrites.cache
            .find(overwrite => overwrite.id === category.guild.roles.everyone.id);

        const getStyle = (permission) => {
            if (!everyoneOverwrite) return ButtonStyle.Secondary;
            if (everyoneOverwrite.allow.has(permission)) return ButtonStyle.Success;
            if (everyoneOverwrite.deny.has(permission)) return ButtonStyle.Danger;
            return ButtonStyle.Secondary;
        };

        const text = new TextDisplayBuilder({ content: `Ce panneau permet de gérer les permissions de la LAN. Voici la liste des options disponibles :\n### <:channel:1440082251366010983> Salons textuels\n* Voir les salons\n* Créer une invitation\n* Envoyer des messages\n* Mettre des réactions\n* Envoyer des messages avec la synthèse vocale\n### <:channel_voice:1511456915312476230> Salons vocaux\n* Se connecter aux salons\n* Vidéo / Stream\n* Soundboard` });

        const separator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
        const separatorLarge = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large);

        const imagePermissions = new AttachmentBuilder().setFile(readFileSync("./config/permissions_icon.png")).setName("permissions.png");
        
        const mediaGallery = new MediaGalleryBuilder()
            .addItems([
                {
                    media: {
                        url: `attachment://permissions.png`
                    }
                }
            ]);

        const textButtons = Object.entries(TEXT_PERMISSIONS).map(([label, permission], x) => {
            client.buttons.set(`switch-permission-btn-text-${x}`, require(`./switch-permission-btn`));
            return new ButtonBuilder()
                .setCustomId(`switch-permission-btn-text-${x}`)
                .setLabel(label)
                .setStyle(getStyle(permission));
        });

        const voiceButtons = Object.entries(VOICE_PERMISSIONS).map(([label, permission], x) => {
            client.buttons.set(`switch-permission-btn-voice-${x}`, require(`./switch-permission-btn`));
            return new ButtonBuilder()
                .setCustomId(`switch-permission-btn-voice-${x}`)
                .setLabel(label)
                .setStyle(getStyle(permission));
        });

        const textRows = [];
        for (let i = 0; i < textButtons.length; i += 3) {
            textRows.push(new ActionRowBuilder().addComponents(textButtons.slice(i, i + 3)));
        }

        const voiceRows = [];
        for (let i = 0; i < voiceButtons.length; i += 3) {
            voiceRows.push(new ActionRowBuilder().addComponents(voiceButtons.slice(i, i + 3)));
        }

        const container = new ContainerBuilder()
            .addMediaGalleryComponents(mediaGallery)
            .addTextDisplayComponents(text)
            .addSeparatorComponents(separator)
            .addActionRowComponents(...textRows)
            .addSeparatorComponents(separatorLarge)
            .addActionRowComponents(...voiceRows);

        return await interaction.channel.send({ components: [container], files: [imagePermissions], flags: [MessageFlags.IsComponentsV2] });
    }
}