const fs = require("fs");

exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    Embed.createEmbed(msg.channel, texts.invite_text, texts.invite_title);
}