const fs = require("fs");

exports.run = (Client, guilds, Embed, mold, mnew) => {

    if(mold == mold.guild.me || mnew == mold.guild.me) return;
    if(!mold.voiceChannel) return;
    if(!mold.guild.me.voiceChannel) return;
    if(!guilds[mold.guild.id]) return;
    if(mold.voiceChannel.members.size < 1 || mold.voiceChannel.members.size > 1) return;
    if(mold.voiceChannel.id == "404312098970140672") return;
    if(mold.voiceChannel == mold.guild.me.voiceChannel && mold.guild.me.voiceChannel.members.size < 2) leave();

    function leave() {
        Client.playermanager.leave(mold.guild.id);
        clearInterval(guilds[mold.guild.id].interval);
        guilds[mold.guild.id].queue = [];
        guilds[mold.guild.id].votes = 0;
        guilds[mold.guild.id].process = 0;
    }
}