const fs = require("fs");

const isPatron = require("../util/isPatron.js");
const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(!isPatron.run(Client, Embed, guild, "Super Donator", msg.author.id, msg, true)) {
        return;
    }

    if(checkDJ.run(Embed, guild, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
        return;
    }

    if(guild.isShuffling) {
        guild.isShuffling = false;
        if(info) {
            Embed.createEmbed(msg.channel, texts.shuffle_deactivated_text, texts.shuffle_deactivated_title);
        }
    } else {
        guild.isShuffling = true;
        if(info) {
            Embed.createEmbed(msg.channel, texts.shuffle_activated_text, texts.shuffle_activated_title);            
        }
    }
}