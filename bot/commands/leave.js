const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guilds, msg) == false) return Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
    
    if(!msg.guild.me.voiceChannel) return Embed.createEmbed(msg.channel, texts.leave_no_channel, texts.error_title);

    if(msg.member.voiceChannel == msg.guild.me.voiceChannel) {
        if(msg.author.id != "254892085000405004") {
            if(msg.guild.me.voiceChannel.guild.id == "403882830225997825") return Embed.createEmbed(msg.channel, texts.bot_stay, texts.error_title);
        }

        Client.playermanager.leave(msg.guild.id);
        clearInterval(guilds[msg.guild.id].interval);
        guilds[msg.guild.id].queue = [];
        guilds[msg.guild.id].votes = 0;
        guilds[msg.guild.id].process = 0;
        Embed.createEmbed(msg.channel, texts.left_text, texts.left_title);
    } else {
        Embed.createEmbed(msg.channel, texts.same_channel, texts.error_title);
    }
}