const fs = require("fs");

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);    

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    Client.functions.createEmbed(msg.channel, texts.command_ping_text + "**" + Math.floor(Client.ping) + "**ms", texts.command_ping_title);
}