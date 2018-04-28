var fs;

const checkDJ = require("../util/checkDJ.js");

exports.run = (Client, guilds, Embed, msg, args) => {

    fs = require('fs');

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    if(!args[0]) {
        Embed.createEmbed(msg.channel, texts.no_arguments, texts.error_title);
    } else if(args[2]) {
        Embed.createEmbed(msg.channel, texts.to_many_arguments, texts.error_title);
    } else {
        var first_song = args[0], second_song = args[1];
        var len = guilds[msg.guild.id].queue.length;

        if(first_song > len || second_song > len || first_song < 1 || second_song < 1) {
            Embed.createEmbed(msg.channel, texts.check_arguments, texts.error_title);
        } else {
            if(isNaN(first_song) || isNaN(second_song)) {
                Embed.createEmbed(msg.channel, texts.check_arguments, texts.error_title);
            } else {
                var fs = first_song - 1;
                var ss = second_song - 1;

                if(fs == ss || fs == 0 || ss == 0) {
                    Embed.createEmbed(msg.channel, texts.cant_switch_positions, texts.error_title);
                    return;
                }
                
                var first_id = guilds[msg.guild.id].queue[fs];

                guilds[msg.guild.id].queue.splice(fs, 1);

                var len_after = guilds[msg.guild.id].queue.length;

                var loop_number = len_after - ss + 1;

                var ind = len_after + 1;
                var set = len_after;

                do {

                    guilds[msg.guild.id].queue[ind] = guilds[msg.guild.id].queue[set];

                    ind--;
                    set--;

                    loop_number--;

                } while(loop_number > 0);

                guilds[msg.guild.id].queue[ss] = first_id;

                var after_splice = len_after + 1;

                guilds[msg.guild.id].queue.splice(after_splice, 1);

                Embed.createEmbed(msg.channel, texts.moved_text, texts.moved_title);
            }
        }
    }
}