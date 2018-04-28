const playing = require("../commands/play.js");

exports.run = async (Client, guilds, Embed, mold, mnew) => {
    var guild = mold.guild;

    if(mold.voiceChannel != guild.me.voiceChannel) {
        return;
    }

    var members = mold.voiceChannel.members.array();

    if(members.length < 2) {
        const player = Client.playermanager.get(mold.guild.id);
        if (!player) return Embed.createEmbed(mold.channel, texts.audio_no_player, texts.error_title);
        await player.pause(true);
        guilds[mold.guild.id].isPaused = true;
        playing.pauseProcessInterval();
    } else {
        if(guilds[mold.guild.id].isPaused) {
            const player = Client.playermanager.get(mold.guild.id);
            if (!player) return Embed.createEmbed(mold.channel, texts.audio_no_player, texts.error_title);
            await player.pause(false);
            guilds[mold.guild.id].isPaused = false;
        }        
    }
}