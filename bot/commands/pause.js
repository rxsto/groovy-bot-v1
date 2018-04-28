const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

const playing = require("../commands/play.js");

exports.run = async (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }
    
    if(guilds[msg.guild.id].isPaused) {
        Embed.createEmbed(msg.channel, texts.paused_nothing, texts.error_title);
    } else {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        await player.pause(true);
        guilds[msg.guild.id].isPaused = true;
        playing.pauseProcessInterval();
        Embed.createEmbed(msg.channel, texts.paused_text, texts.paused_title);
    }
}