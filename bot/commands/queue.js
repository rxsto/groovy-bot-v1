const fs = require("fs");

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(guilds[msg.guild.id].queue.length <= 0) {
        Embed.createEmbed(msg.channel, texts.queue_nothing, texts.error_title);        
    } else {
        var message = "";
            for (var i = 0; i < guilds[msg.guild.id].queue.length; i++) {
                var temp = (i === 0 ? "\n**" + texts.queue_current + "**\n" : "") + (i === 1 ? "\n**" + texts.queue_upnext + "**\n" : "") + "▫️ **" + (i + 1) + ":** " + guilds[msg.guild.id].queue[i].info.title + "\n";
            if ((message + temp).length <= 2000 - 3) {
                message += temp;
            } else {
                msg.channel.send(message);
            }
        }
        Embed.createEmbed(msg.channel, message, texts.queue_title);
    }
}