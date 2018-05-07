const fs = require("fs");

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    Embed.createEmbed(msg.channel, texts.ping_text + "**" + Client.ping + "**ms", texts.ping_title);
}