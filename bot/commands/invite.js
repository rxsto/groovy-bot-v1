const fs = require("fs");

module.exports.run = (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    Embed.createEmbed(msg.channel, texts.invite_text, texts.invite_title);
}