const fs = require("fs");

const isPatron = require("../util/isPatron.js");
const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, guilds, Embed, msg, args, info) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(!isPatron.run(Client, Embed, guilds, "Super Donator", msg.author.id, msg, true)) {
        return;
    }

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    if(guilds[msg.guild.id].isShuffling) {
        guilds[msg.guild.id].isShuffling = false;
        if(info) {
            Embed.createEmbed(msg.channel, texts.shuffle_deactivated_text, texts.shuffle_deactivated_title);
        }
    } else {
        guilds[msg.guild.id].isShuffling = true;
        if(info) {
            Embed.createEmbed(msg.channel, texts.shuffle_activated_text, texts.shuffle_activated_title);            
        }
    }
}