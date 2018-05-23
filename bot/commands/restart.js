const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    const player = Client.playermanager.get(msg.guild.id);
    if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);

    clearInterval(guild.interval);
    guild.process = 0;

    try {
        await player.play(guild.queue[0].track);
    } catch (error) {
        console.log(error);
    }

    Embed.createEmbed(msg.channel, texts.reset_text, texts.reset_title);
}