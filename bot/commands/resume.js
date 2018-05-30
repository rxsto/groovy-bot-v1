const fs = require("fs");

module.exports.run = async (Client, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, texts.same_channel, texts.error_title);

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);

    if(!guild.isPaused) {
        Client.functions.createEmbed(msg.channel, texts.resumed_nothing, texts.error_title);
    } else {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Client.functions.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        await player.pause(false);
        guild.isPaused = false;        
        guild.interval = setInterval(function(){ guild.process++ }, 1000);
        if(info) {
            Client.functions.createEmbed(msg.channel, texts.resumed_text, texts.resumed_title);
        }
    }
}