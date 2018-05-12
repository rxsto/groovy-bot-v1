const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
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
        if(guild.queue[pos]) {
            guild.queue.splice(pos, 1);
            Embed.createEmbed(msg.channel, texts.removed_successfully + args + ".", texts.removed_title);
        } else {
            Embed.createEmbed(msg.channel, texts.removed_no_song, texts.error_title);
        }
    }
}