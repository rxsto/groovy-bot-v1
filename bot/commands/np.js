const fs = require("fs");

exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(!guilds[msg.guild.id].queue[0]) {
        Embed.createEmbed(msg.channel, texts.np_nothing, texts.np_title);
        return;
    }

    var pr = guilds[msg.guild.id].process;
    var ln = (guilds[msg.guild.id].queue[0].info.length / 1000);
    var go = (pr / ln) * 10;

    var percentage = Math.floor(go);

    Embed.createEmbed(msg.channel, ((!guilds[msg.guild.id].isPaused ? ":arrow_forward: " : ":pause_button: ") + getpercentage(percentage) + " `[" + new Date(guilds[msg.guild.id].process * 1000).toISOString().substr(11, 8) + "/" + new Date(guilds[msg.guild.id].queue[0].info.length).toISOString().substr(11, 8) + "]`"  + (guilds[msg.guild.id].loopSong ? " :repeat_one:" : "") + (guilds[msg.guild.id].loopQueue ? " :repeat:" : "") + (guilds[msg.guild.id].isShuffling ? " :twisted_rightwards_arrows:" : "") + " :loud_sound:"), guilds[msg.guild.id].queue[0].info.title);

    function getpercentage(percentage) {
        if(percentage == 0) {
            return "🔘▬▬▬▬▬▬▬▬▬";
        } else if(percentage == 1) {
            return "▬🔘▬▬▬▬▬▬▬▬";
        } else if(percentage == 2) {
            return "▬▬🔘▬▬▬▬▬▬▬";
        } else if(percentage == 3) {
            return "▬▬▬🔘▬▬▬▬▬▬";
        } else if(percentage == 4) {
            return "▬▬▬▬🔘▬▬▬▬▬";
        } else if(percentage == 5) {
            return "▬▬▬▬▬🔘▬▬▬▬";
        } else if(percentage == 6) {
            return "▬▬▬▬▬▬🔘▬▬▬";
        } else if(percentage == 7) {
            return "▬▬▬▬▬▬▬🔘▬▬";
        } else if(percentage == 8) {
            return "▬▬▬▬▬▬▬▬🔘▬";
        } else if(percentage == 9) {
            return "▬▬▬▬▬▬▬▬▬🔘";
        } else {
            return "🔘▬▬▬▬▬▬▬▬▬";
        }
    }
}