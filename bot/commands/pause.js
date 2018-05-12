const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, Embed, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);    

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }
    
    if(guild.isPaused) {
        Embed.createEmbed(msg.channel, texts.paused_nothing, texts.error_title);
    } else {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        await player.pause(true);
        guild.isPaused = true;
        clearInterval(guild.interval);
        if(info) {
            Embed.createEmbed(msg.channel, texts.paused_text, texts.paused_title);
        }
    }
}