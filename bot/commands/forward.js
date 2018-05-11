const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    if(args[1]) return Embed.createEmbed(msg.channel, texts.invalid_seek_position, texts.error_title);

    var content = args.join(" ");
    var position;
    var amount;
    
    try {
        position = content.split(":");
    } catch (error) {
        console.log(error);
    }

    if(position.length > 4 || position.length < 1) return Embed.createEmbed(msg.channel, texts.invalid_seek_position, texts.error_title);

    switch (position.length) {
        case 1:
        amount = position.join("");
        break;


        case 2:
        amount = (+position[0]) * 60 + (+position[1]);
        break;


        case 3:
        amount = (+position[0]) * 60 * 60 + (+position[1]) * 60 + (+position[2]);
        break;

    
        default:
        return;
    }

    const player = Client.playermanager.get(msg.guild.id);
    if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
    
    guilds[msg.guild.id].process = guilds[msg.guild.id].process + amount;
    var jumpto = (guilds[msg.guild.id].process + amount) * 1000;

    player.seek(jumpto);
    Embed.createEmbed(msg.channel, ":fast_forward: " + texts.seek_text + "`" + new Date(jumpto).toISOString().substr(11, 8) + "`!", texts.seek_title);
}