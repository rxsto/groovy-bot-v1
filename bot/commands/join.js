const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var vc = msg.member.voiceChannel;

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    if(vc == msg.guild.me.voiceChannel) return Embed.createEmbed(msg.channel, texts.is_same_vc, texts.error_title);

    if(!vc) return Embed.createEmbed(msg.channel, texts.no_channel, texts.error_title);

    if (!vc.joinable) {
        return Embed.createEmbed(msg.channel, texts.no_perms_connect, texts.error_title);
    } else if (!vc.speakable) {
        return Embed.createEmbed(msg.channel, texts.no_perms_speak, texts.error_title);
    }
    
    const player = await Client.playermanager.join({
        guild: msg.guild.id,
        channel: msg.member.voiceChannelID,
        host: "127.0.0.1"
    });

    Embed.createEmbed(msg.channel, texts.joined_text, texts.joined_title);
}