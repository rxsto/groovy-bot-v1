const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, guilds, Embed, msg, args, info) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    if(guilds[msg.guild.id].loopSong) {
        guilds[msg.guild.id].loopSong = false;
        if(info) {
            Embed.createEmbed(msg.channel, texts.loop_deactivated_text, texts.loop_deactivated_title);
        }
    } else {
        guilds[msg.guild.id].loopSong = true;
        if(info) {
            Embed.createEmbed(msg.channel, texts.loop_activated_text, texts.loop_activated_title);            
        }
    }
}