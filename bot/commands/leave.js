const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");
const playing = require("../commands/play.js");

exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }
    
    if(!msg.member.voiceChannel) return;

    if(msg.member.voiceChannel == msg.guild.me.voiceChannel) {
        if(msg.guild.id == "403882830225997825" || msg.guild.me.voiceChannel == "404312098970140672") {
            Embed.createEmbed(msg.channel, texts.bot_stay, texts.error_title);
        } else {
            Client.playermanager.leave(msg.guild.id);
            playing.pauseProcessInterval();
            guilds[msg.guild.id].queue = [];
            guilds[msg.guild.id].votes = 0;
            guilds[msg.guild.id].process = 0;
            Embed.createEmbed(msg.channel, texts.left_text, texts.left_title);
        }            
    } else {
        Embed.createEmbed(msg.channel, texts.same_channel, texts.error_title);
    }
}