const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, guilds, Embed, msg, args, info) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    if(!guilds[msg.guild.id].isPaused) {
        Embed.createEmbed(msg.channel, texts.resumed_nothing, texts.error_title);
    } else {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        await player.pause(false);
        guilds[msg.guild.id].isPaused = false;        
        guilds[msg.guild.id].interval = setInterval(function(){ guilds[msg.guild.id].process++ }, 1000);
        if(info) {
            Embed.createEmbed(msg.channel, texts.resumed_text, texts.resumed_title);
        }
    }
}