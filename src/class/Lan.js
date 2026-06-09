const dayjs = require("dayjs");
const { formatUrl } = require("../functions/utils/formatUrl");
const { decrypt } = require("../functions/utils/crypt");
const lanModel = require("../schemas/lan");
const { createCanvas, loadImage } = require('canvas');
const { ChannelType } = require("discord.js");

class Lan {
    /**
     * A LAN object representation
     * @param {String} name
     * @param {Array<object>} channels 
     * @param {object} config
     * @param {Array<string>} participants
     * @param {string} id
     * @param {Number} start
     * @param {Number} end
     * @param {string} guildId
     */
    static model = lanModel;
    static DEFAULT_DAYS = 3;

    constructor(name, channels, config, participants, id = null, start = null, end = null, guildId = null) {
        this.id = id;
        this.guildId = guildId;
        this.name = name;
        this.channels = channels;
        this.config = config;
        this.participants = participants;
        // Get the timestamp in seconds
        this.startedAt = start !== null ? start : this.#dateFormater();
        this.endedAt = end ?? null;
    }

    #dateFormater(date = new Date()) {
        const [hour, minute] = this.config.hours.split('h').map(Number);
    
        date.setHours(hour, minute, 0, 0);
        
        return Math.floor(date.getTime() / 1000);
    }    

    end(addDays = 0) {
        this.endedAt = Math.floor(Date.now() / 1000) + (addDays * 24 * 60 * 60) 
    }

    getAgendaLink() {
        const address = decrypt(this.config.address, process.env.TOKEN);
        const description = `On se donne rendez-vous pour la ${this.name} !\n\nAdresse : ${address}`;
        
        const startDate = dayjs(this.startedAt * 1000).format('YYYYMMDDTHHmmss');
        const estimatedDate = this.endedAt ?? Math.floor(Date.now() / 1000) + (Lan.DEFAULT_DAYS * 24 * 60 * 60);
        const endDate = dayjs(estimatedDate * 1000).format('YYYYMMDDTHHmmss');

        return formatUrl('https://www.google.com/calendar/render', {
            action: 'TEMPLATE',
            text: this.name,
            details: description,
            location: address,
            dates: `${startDate}/${endDate}`
        }, { isAddress: true })
    }

    getGoogleMapsLink() {
        return formatUrl('https://www.google.com/maps/search/', { 
            api: 1, 
            location: decrypt(this.config.address, process.env.TOKEN)
        }, { isAddress: true });
    }

    getWazeLink() {
        return formatUrl('https://waze.com/ul', 
            { location: decrypt(this.config.address, process.env.TOKEN) }, 
            { isAddress: true, locationQueryParamName: "q" }
        );
    }

    /**
     * Create a LAN in database
     */
    async create() {
        const lanObject = await Lan.model.create({
            guildId: this.guildId,
            name: this.name,
            config: this.config._id,
            channels: this.channels,
            startedAt: new Date(this.startedAt * 1000),
            endedAt: this.endedAt !== null ? new Date(this.endedAt * 1000) : null,
        })

        this.id = lanObject._id.toString();
    }

    /**
     * Delete a LAN from database
     * @param {string} id Id of a Lan that we need to delete
     */
    static async deleteById(id) {
        await Lan.model.findByIdAndDelete(id);
    }

    /**
     * Add a participant to a LAN
     * @param {string} discordId The discord ID of the participant of the current lan
     */
    async addParticipants(discordId) {
        this.participants.push(discordId);

        await Lan.model.findByIdAndUpdate(this.id, {
            participants: this.participants
        })
    }

    /**
     * Reset the participants of a LAN
     */
    async resetParticipants() {
        this.participants = [];

        await Lan.model.findByIdAndUpdate(this.id, {
            participants: []
        })
    }

    /**
     * Set the participants of a LAN
     * @param {Array<string>} participants List of participants
     */
    async setParticipants(participants) {
        this.participants = participants;

        await Lan.model.findByIdAndUpdate(this.id, {
            participants: this.participants
        })
    }

    /**
     * Remove a participant from a LAN
     * @param {string} discordId - The discord ID of the participant of the current lan
     */
    async removeParticipants(discordId) {
        this.participants = this.participants.filter(p => p !== discordId);
        
        await Lan.model.findByIdAndUpdate(this.id, {
            participants: this.participants
        })
    }


    /**
     * Add a channel to the LAN channels list
     * @param {object} channel - Channel to add to the LAN channels list
     */
    
    async addChannel(channelName, guild, type=ChannelType.GuildText) {
        if (this.channels.some(c => c.name === channelName))
            throw new Error(`Un salon "${channelName}" existe déjà.`);

        const generalChannelId = this.channels.find(c => c.name === "général").channelId;

        const category = await guild.channels.cache.get(generalChannelId).parent;
        const channel = await guild.channels.create({
            name: type === ChannelType.GuildVoice  ? `🔊 ${channelName}` : channelName,
            type: type,
            parent: category.id,
        });

        const channelObjet = {
            name: channelName,
            channelId: channel.id,
        }

        this.channels.push(channelObjet);

        await Lan.model.findByIdAndUpdate(this.id, {
            channels: this.channels
        })
    }

    /**
     * Remove channels from the LAN channels list
     * @param {Array<string>} channelIds - Channel IDs to remove from the LAN channels list
     * @param {Guild} guild - guild Discord
     */
    async removeChannels(channelIds, guild) {
        const alwaysActiveIds = new Set(
            this.channels.filter(c => c.alwaysActive).map(c => c.channelId)
        );

        const forbidden = channelIds.filter(id => alwaysActiveIds.has(id));
        if (forbidden.length)
            throw new Error(`Certains salons sont obligatoires et ne peuvent pas être supprimés.`);

        this.channels = this.channels.filter(c => !channelIds.includes(c.channelId));

        await Promise.all([
            ...channelIds.map(id => guild.channels.cache.get(id)?.delete().catch(() => {})),
            Lan.model.findByIdAndUpdate(this.id, { channels: this.channels })
        ]);
    }

    /**
     * Generate participants list in an image
     * @param {Guild} guild - guild Discord
     * @param {number} size - width/height avatar (64 recommended)
     * @param {Array<string>} usersIdArray - If you wish to generate the image including only certain participants without affecting the final list of participants, please enter their usernames in this Array
     * @returns {Promise<Buffer>}
     */
    async generateParticipantsImage(guild, size = 64, usersIdArray = null) {
        const paticipantsList = usersIdArray ?? this.participants;
        if (!paticipantsList.length) throw new Error("No participants provided");

        const spacing = 10;
        const textPadding = 10;
        const fontSize = 20;

        const columns = paticipantsList.length > 6 ? 3 : 2;
        const rows = Math.ceil(paticipantsList.length / columns);

        const cellWidth = size + 200;

        const width = columns * cellWidth;
        const height = rows * (size + spacing);

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Fond transparent
        ctx.clearRect(0, 0, width, height);

        // Texte
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < paticipantsList.length; i++) {
            const col = i % columns;
            const row = Math.floor(i / columns);

            const x = col * cellWidth;
            const y = row * (size + spacing);

            const member = await guild.members.fetch(paticipantsList[i]).catch(() => {});
            if (!member) continue;

            const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
            const avatar = await loadImage(avatarURL);

            // Avatar
            ctx.drawImage(avatar, x, y, size, size);

            // Pseudo
            ctx.fillText(member.displayName, x + size + textPadding, y + size / 2);
        }

        return canvas.toBuffer('image/png');
    }
}

module.exports = { Lan }