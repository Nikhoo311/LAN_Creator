# LAN Creator

LAN Creator est un bot Discord permettant de créer et d'administrer l'espace
d'une LAN party directement depuis un serveur Discord. Il crée les salons de
l'événement, publie les informations pratiques, gère les inscriptions et met
à disposition un espace de gestion privé pour les organisateurs.

## Fonctionnalités

- Création de configurations réutilisables (adresse, heure, matériel et
  salons).
- Création d'une catégorie Discord dédiée à chaque LAN.
- Création automatique des salons `général`, `photos` et `informations`, ainsi
  que des salons configurés et vocaux.
- Publication des liens Google Maps, Waze et Google Agenda.
- Inscription et désinscription des participants, avec liste illustrée.
- Ajout d'un flyer et d'un lien Google Sheets facultatifs.
- Fil privé de gestion : participants, salons, permissions, flyer et
  administrateurs du fil.
- Archivage : les salons vocaux et textuels sont supprimés, à l'exception de
  `photos`, qui est conservé en lecture seule avec la catégorie.

## Prérequis

- Node.js 18 ou une version plus récente.
- Une application Discord et son bot.
- Une base MongoDB accessible par le bot.
- Les permissions Discord permettant notamment de gérer les salons, les fils,
  les permissions de salons, les messages et les pièces jointes.

## Installation

1. Clonez le dépôt puis installez les dépendances.

   ```bash
   git clone https://github.com/Nikhoo311/LAN_Creator.git
   cd LAN_Creator
   npm install
   ```

2. Créez le fichier de configuration public à partir de l'exemple.

   ```bash
   Copy-Item config/examples/config.example.json config/config.json
   ```

   Sous macOS ou Linux :

   ```bash
   cp config/examples/config.example.json config/config.json
   ```

3. Copiez `.env.example` en `.env`, puis complétez ses valeurs.

   ```env
   TOKEN=BOT_TOKEN
   DB_URL=mongodb+srv://<utilisateur>:<mot_de_passe>@<cluster>/<base>
   DEV_MODE=true
   ```

4. Renseignez `config/config.json` :

   ```json
   {
     "clientID": "APPLICATION_ID",
     "serverID": "SERVER_ID",
     "color": {
       "blue": "#00ADB5"
     }
   }
   ```

   Conservez l'ensemble de la palette présente dans le fichier exemple. Le
   champ `serverID` est utilisé lorsque `DEV_MODE=true` pour enregistrer les
   commandes immédiatement sur un serveur de développement.

5. Démarrez le bot.

   ```bash
   npm run dev
   ```

## Configuration Discord

Dans le portail développeur Discord, activez les intents nécessaires au bot,
notamment **Server Members Intent** et **Message Content Intent**. Le bot lit
ponctuellement les messages envoyés par les organisateurs afin d'ajouter des
salons ou des administrateurs.

Invitez ensuite le bot sur votre serveur avec les scopes `bot` et
`applications.commands`. Pour un fonctionnement complet, accordez-lui au
minimum les droits de voir et envoyer des messages, gérer les salons, gérer
les fils, gérer les permissions de salons et joindre/téléverser des fichiers.

> Ne publiez jamais `.env`, `config/config.json`, votre token Discord ou votre
> URL MongoDB. Ces fichiers sont ignorés par Git par défaut.

## Utilisation

1. Exécutez `/create` dans le salon où vous souhaitez publier le panneau de
   création.
2. Cliquez sur **Configurer**, puis créez une configuration. Une configuration
   définit le lieu, l'heure d'arrivée, le matériel disponible et les salons à
   créer.
3. Cliquez sur **Créer une LAN**, choisissez une configuration et renseignez
   les options souhaitées : flyer, nombre de vocaux, dates, participants de
   départ ou Google Sheets.
4. Le bot crée une catégorie et ouvre un fil privé **Gestion** dans `général`.
   Les boutons de ce fil servent à administrer la LAN.

Les salons `général`, `informations` et `photos` font partie du fonctionnement
normal du bot. Le salon `photos` est le seul salon conservé après archivage.

## Données et comportement

- Les configurations sont propres à chaque serveur Discord.
- Une LAN créée conserve les données nécessaires à son fonctionnement : la
  suppression ultérieure de sa configuration ne doit pas modifier la LAN.
- Sans date de fin, une LAN demeure active jusqu'à son archivage.
- Lorsqu'un organisateur restreint l'accès aux salons, seuls les participants
  déjà inscrits reçoivent l'accès. Les inscriptions ultérieures ne l'ajoutent
  pas automatiquement.
- L'accès au panneau de création et aux actions de gestion n'est pas encore
  limité à un rôle d'administration : installez le bot uniquement sur un
  serveur de confiance ou encadrez son usage via les permissions Discord.

## Développement

La commande suivante enregistre les slash commands puis démarre le bot :

```bash
npm run dev
```

Avec `DEV_MODE=true`, les commandes sont enregistrées sur le serveur indiqué
par `serverID`. Avec `DEV_MODE=false`, elles sont enregistrées globalement ;
Discord peut alors prendre du temps à les rendre disponibles.

## Licence

Ce projet est distribué sous [PolyForm Noncommercial 1.0.0](LICENSE). Le code
est disponible à la consultation, à la modification et au partage pour des
usages non commerciaux ; cette licence n'est pas une licence open source au
sens strict.
