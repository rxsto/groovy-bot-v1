const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, guilds, Embed, msg, args, info) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    for (var song = 0; song < guilds[msg.guild.id].queue.length; song++) {
        var member_to_test = guilds[msg.guild.id].queue[song].info.member;
        if(member_to_test.voiceChannel != msg.guild.me.voiceChannel) {
            guilds[msg.guild.id].queue.splice(check, 1);
        }
    }

    Embed.createEmbed(msg.channel, texts.leavecleanup_text, texts.leavecleanup_title);
}