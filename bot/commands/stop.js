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
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        guilds[msg.guild.id].queue = [];
        guilds[msg.guild.id].votes = 0;
        guilds[msg.guild.id].process = 0;
        playing.pauseProcessInterval();
        player.stop();
        Embed.createEmbed(msg.channel, texts.stop_text, texts.stop_title);
    } else {
        Embed.createEmbed(msg.channel, texts.same_channel, texts.error_title);
    }
}