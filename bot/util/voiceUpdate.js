const fs = require("fs");

var playing;

exports.run = async (Client, guilds, Embed, mold, mnew) => {
    playing = require("../commands/play.js");
    var guild = mold.guild;

    if(mold.voiceChannel != guild.me.voiceChannel && mnew.voiceChannel != guild.me.voiceChannel) {
        return;
    }

    if(!guild.me.voiceChannel) return;
    var members = guild.me.voiceChannel.members.array();

    if(members.length < 2) {
        if(!guilds[mold.guild.id].isPaused) {
            const player = Client.playermanager.get(mold.guild.id);
            if (!player) return Embed.createEmbed(mold.channel, texts.audio_no_player, texts.error_title);
            await player.pause(true);
            guilds[mold.guild.id].isPaused = true;
            playing.pauseProcessInterval();
        }
    } else if(members.length > 1) {
        if(guilds[mold.guild.id].isPaused) {
            const player = Client.playermanager.get(mold.guild.id);
            if (!player) return Embed.createEmbed(mold.channel, texts.audio_no_player, texts.error_title);
            await player.pause(false);
            guilds[mold.guild.id].isPaused = false;
            playing.resumeProcessInterval();
        }
    } else {
        return;
    }
}