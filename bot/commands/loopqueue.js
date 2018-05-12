const fs = require("fs");

const isPatron = require("../util/isPatron.js");
const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));    

    if(!isPatron.run(Client, Embed, guild, "Special", msg.author.id, msg, true)) {
        return;
    }

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    if(guild.loopQueue) {
        guild.loopQueue = false;
        if(info) {
            Embed.createEmbed(msg.channel, texts.loopqueue_deactivated_text, texts.loopqueue_deactivated_title);
        }
    } else {
        guild.loopQueue = true;
        if(info) {
            Embed.createEmbed(msg.channel, texts.loopqueue_activated_text, texts.loopqueue_activated_title);            
        }
    }
}