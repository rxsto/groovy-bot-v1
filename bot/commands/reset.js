const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");
const playing = require("../commands/play.js");

module.exports.run = async (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    const player = Client.playermanager.get(msg.guild.id);
    if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);

    playing.pauseProcessInterval();    
    guilds[msg.guild.id].process = 0;

    try {
        await player.play(guilds[msg.guild.id].queue[0]);        
    } catch (error) {
        console.log(error);
    }

    Embed.createEmbed(msg.channel, texts.reset_text, texts.reset_title);
}