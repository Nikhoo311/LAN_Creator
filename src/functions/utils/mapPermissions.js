const { PermissionFlagsBits } = require('discord.js');

const TEXT_PERMISSIONS = {
    'Voir les salons': PermissionFlagsBits.ViewChannel,
    'Créer une invitation': PermissionFlagsBits.CreateInstantInvite,
    'Envoyer des messages': PermissionFlagsBits.SendMessages,
    'Mettre des réactions': PermissionFlagsBits.AddReactions,
    'Synthèse vocale': PermissionFlagsBits.SendTTSMessages,
};

const VOICE_PERMISSIONS = {
    'Vidéo / Stream': PermissionFlagsBits.Stream,
    'Soundboard': PermissionFlagsBits.UseSoundboard,
    'Se connecter aux salons': PermissionFlagsBits.Connect,
    'Utiliser les Activités': PermissionFlagsBits.UseEmbeddedActivities
};

const LABEL_PERMISSIONS = {
    ...TEXT_PERMISSIONS,
    ...VOICE_PERMISSIONS
};

module.exports = { TEXT_PERMISSIONS, VOICE_PERMISSIONS, LABEL_PERMISSIONS };