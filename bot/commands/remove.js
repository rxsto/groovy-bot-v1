const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }
    
    if(!args[0]) {
        Embed.createEmbed(msg.channel, texts.removed_no_args, texts.error_title);
    } else if(args[1]) {
        Embed.createEmbed(msg.channel, texts.removed_two_args, texts.error_title);
    } else {
        if(isNaN(args[0])) return Embed.createEmbed(msg.channel, texts.removed_no_number, texts.error_title);
        if(args.join(" ") == 1) return Embed.createEmbed(msg.channel, texts.removed_first_number, texts.error_title);
        var pos = args - 1;
        if(guilds[msg.guild.id].queue[pos]) {
            guilds[msg.guild.id].queue.splice(pos, 1);
            Embed.createEmbed(msg.channel, texts.removed_successfully + args + ".", texts.removed_title);
        } else {
            Embed.createEmbed(msg.channel, texts.removed_no_song, texts.error_title);
        }
    }
}