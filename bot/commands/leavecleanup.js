const Discord = require("discord.js");
const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    var seen = new Discord.Collection();

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    guild.queue.forEach(song => {
        if(song.track == guild.queue[0].track) return seen.set(song.track, song);
        if(msg.guild.me.voiceChannel.members.has(song.info.member.user.id)) seen.set(song.track, song);
    });

    guild.queue = seen.array();

    Embed.createEmbed(msg.channel, texts.leavecleanup_text, texts.leavecleanup_title);
}