const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    if(guild.loopSong) {
        guild.loopSong = false;
        if(info) {
            Embed.createEmbed(msg.channel, texts.loop_deactivated_text, texts.loop_deactivated_title);
        }
    } else {
        guild.loopSong = true;
        if(info) {
            Embed.createEmbed(msg.channel, texts.loop_activated_text, texts.loop_activated_title);            
        }
    }
}