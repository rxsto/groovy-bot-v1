const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = (Client, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    var seen = new Discord.Collection();

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, texts.same_channel, texts.error_title);

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);

    guild.queue.forEach(song => {
        if(!seen.has(song.track)) seen.set(song.track, song);
    });

    guild.queue = seen.array();

    Client.functions.createEmbed(msg.channel, texts.removedupes_text, texts.removedupes_title);
}