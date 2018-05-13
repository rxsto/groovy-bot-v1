const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(checkDJ.run(Embed, guild, msg) == false) return Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
    
    if(!msg.guild.me.voiceChannel) return Embed.createEmbed(msg.channel, texts.leave_no_channel, texts.error_title);

    if(msg.member.voiceChannel == msg.guild.me.voiceChannel) {
        if(msg.author.id != "254892085000405004") {
            if(msg.guild.me.voiceChannel.guild.id == "403882830225997825") return Embed.createEmbed(msg.channel, texts.bot_stay, texts.error_title);
        }

        Client.playermanager.leave(msg.guild.id);
        clearInterval(guild.interval);
        guild.queue = [];
        guild.votes.clear();
        guild.process = 0;
        guild.isPaused = false;
        guild.isPlaying = false;
        Embed.createEmbed(msg.channel, texts.left_text, texts.left_title);
    } else {
        Embed.createEmbed(msg.channel, texts.same_channel, texts.error_title);
    }
}