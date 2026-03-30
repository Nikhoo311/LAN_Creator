const dayjs = require("dayjs");
const { URL, URLSearchParams } = require("url");
const { decrypt } = require("../functions/utils/crypt");
const lanModel = require("../schemas/lan");
const { createCanvas, loadImage } = require('canvas');

class Lan {
    /**
     * A LAN object representation
     * @param {String} name
     * @param {Array<object>} channels 
     * @param {object} config
     * @param {Array<string>}
     * @param {Date} start
     * @param {Date} end
     */
    static model = lanModel;
    constructor(name, channels, config, participants, id = null, start = null, end = null, guildId = null) {
        this.id = id;
        this.guildId = guildId;
        this.name = name;
        this.channels = channels;
        this.config = config;
        this.participants = participants;
        // Get the timestamp in seconds
        this.startedAt = start !== null ? start : this.start();
        this.endedAt = end;
    }

    start() {
        const [hour, minute] = this.config.hours.split('h').map(Number);
    
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        
        return Math.floor(date.getTime() / 1000);
    }    

    end(addDays = 0) {
        this.endedAt = Math.floor(Date.now() / 1000) + (addDays * 24 * 60 * 60) 
    }

    getAgendaLink() {
        const getUrl = function(title, desc, locat, start, end) {
            const uri = new URL('https://www.google.com/calendar/render');
            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: title,
                details: desc,
                location: locat,
                dates: start + '/' + end
            });
            uri.search = params.toString();
            return uri.toString();
        };

        let description = `On se donne rendez-vous pour la ${this.name} !\n\nadresse : ${decrypt(this.config.address, process.env.TOKEN)}`;
        // end = default 3 days
        const estimatedDate = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60);
        return getUrl(this.name, description, decrypt(this.config.address, process.env.TOKEN), dayjs(this.startedAt * 1000).format('YYYYMMDDTHHmmss'), dayjs(estimatedDate * 1000).format('YYYYMMDDTHHmmss'));
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

    async removeParticipants(discordId) {
        this.participants = this.participants.filter(p => p !== discordId);
        
        await Lan.model.findByIdAndUpdate(this.id, {
            participants: this.participants
        })
    }

    /**
     * Generate participants list in an image
     * @param {Guild} guild - guild Discord
     * @param {number} size - width/height avatar (64 recommended)
     * @returns {Promise<Buffer>}
     */
    async generateParticipantsImage(guild, size = 64) {
        if (!this.participants.length) throw new Error("No participants provided");

        const spacing = 10;
        const textPadding = 10;
        const fontSize = 20;

        const columns = this.participants.length > 6 ? 3 : 2;
        const rows = Math.ceil(this.participants.length / columns);

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

        for (let i = 0; i < this.participants.length; i++) {
            const col = i % columns;
            const row = Math.floor(i / columns);

            const x = col * cellWidth;
            const y = row * (size + spacing);

            const member = await guild.members.fetch(this.participants[i]).catch(() => null);
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