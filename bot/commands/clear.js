const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    if(!guilds[msg.guild.id].queue[0]) return Embed.createEmbed(msg.channel, texts.queue_empty, texts.error_title);

    var first = guilds[msg.guild.id].queue[0];

    guilds[msg.guild.id].queue = []
    guilds[msg.guild.id].queue.push(first);

    Embed.createEmbed(msg.channel, texts.cleared_queue_text, texts.cleared_queue_title);
}