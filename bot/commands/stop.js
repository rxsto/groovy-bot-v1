const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, Embed, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }
    
    if(!msg.member.voiceChannel) return;

    if(msg.member.voiceChannel == msg.guild.me.voiceChannel) {
        const player = await Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        guild.queue = [];
        await guild.votes.clear();
        guild.process = 0;
        guild.isPaused = false;
        guild.isPlaying = false;
        clearInterval(guild.interval);
        await player.stop();
        if(info) {
            Embed.createEmbed(msg.channel, texts.stop_text, texts.stop_title);
        }
    } else {
        Embed.createEmbed(msg.channel, texts.same_channel, texts.error_title);
    }
}