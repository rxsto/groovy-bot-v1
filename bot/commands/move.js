var fs;

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);    

    fs = require("fs");
    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_same_channel, texts.error_title);

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_dj + "`" + guild.djRole + "`!", texts.error_title);

    if(!args[0]) {
        Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_arguments, texts.error_title);
    } else if(args[2]) {
        Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_to_many_arguments, texts.error_title);
    } else {
        var first_song = args[0], second_song = args[1];
        var len = guild.queue.length;

        if(first_song > len || second_song > len || first_song < 1 || second_song < 1) {
            Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_check_args, texts.error_title);
        } else {
            if(isNaN(first_song) || isNaN(second_song)) {
                Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_check_args, texts.error_title);
            } else {
                var fs = first_song - 1;
                var ss = second_song - 1;

                if(fs == ss || fs == 0 || ss == 0) {
                    Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.command_move_cannot_switch, texts.error_title);
                    return;
                }
                
                var first_id = guild.queue[fs];

                guild.queue.splice(fs, 1);

                var len_after = guild.queue.length;

                var loop_number = len_after - ss + 1;

                var ind = len_after + 1;
                var set = len_after;

                do {

                    guild.queue[ind] = guild.queue[set];

                    ind--;
                    set--;

                    loop_number--;

                } while(loop_number > 0);

                guild.queue[ss] = first_id;

                var after_splice = len_after + 1;

                guild.queue.splice(after_splice, 1);

                Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + texts.command_move_text, texts.command_move_title);
            }
        }
    }
}