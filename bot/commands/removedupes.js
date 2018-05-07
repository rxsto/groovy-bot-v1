const Discord = require("discord.js");
const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, guilds, Embed, msg, args, info) => {

    var seen = new Discord.Collection();

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    guilds[msg.guild.id].queue.forEach(song => {
        if(!seen.has(song.track)) seen.set(song.track, song);
    });

    guilds[msg.guild.id].queue = seen.array();

    Embed.createEmbed(msg.channel, texts.removedupes_text, texts.removedupes_title);
}