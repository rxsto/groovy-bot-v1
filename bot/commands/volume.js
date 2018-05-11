const fs = require("fs");

const isPatron = require("../util/isPatron.js");
const checkDJ = require("../util/checkDJ.js");

module.exports.run = async (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(!isPatron.run(Client, Embed, guilds, "Donator", msg.author.id, msg, true)) return;

    if(checkDJ.run(Embed, guilds, msg) == false) {
        Embed.createEmbed(msg.channel, texts.no_dj + "`" + guilds[msg.guild.id].djRole + "`!", texts.error_title);
        return;
    }

    if(!args[0] || args[1]) {
        Embed.createEmbed(msg.channel, texts.volume_args, texts.error_title);
    } else if(!isNaN(args.join("")) && args >= 1 && args <= 100) {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);

        player.volume(parseInt(args[0]));

        Embed.createEmbed(msg.channel, texts.volume_text + args + " %.", texts.volume_title);
    } else {
        Embed.createEmbed(msg.channel, texts.volume_error, texts.error_title);
    }
}