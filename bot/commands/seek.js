const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    if(!args[0]) return Embed.createEmbed(msg.channel, texts.no_arguments, texts.error_title);
    if(args[1]) return Embed.createEmbed(msg.channel, texts.invalid_seek_position, texts.error_title);

    var content = args.join(" ");
    var position = content.split(":");
    var amount;
    var get = false;

    position.forEach(number => {
        if(isNaN(number)) get = true;
    });

    if(get == true) return Embed.createEmbed(msg.channel, texts.no_number, texts.error_title);

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

    var jumpto = amount * 1000;
    if(jumpto > guild.queue[0].info.length) return Embed.createEmbed(msg.channel, texts.number_to_big, texts.error_title);
    guild.process = jumpto / 1000;

    player.seek(jumpto);
    Embed.createEmbed(msg.channel, ":fast_forward: " + texts.seek_text + "`" + new Date(jumpto).toISOString().substr(11, 8) + "`!", texts.seek_title);
}