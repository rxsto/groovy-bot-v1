const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    if(!guild.queue[0]) return Embed.createEmbed(msg.channel, texts.queue_empty, texts.error_title);

    var first = guild.queue[0];

    guild.queue = []
    guild.queue.push(first);

    Embed.createEmbed(msg.channel, texts.cleared_queue_text, texts.cleared_queue_title);
}