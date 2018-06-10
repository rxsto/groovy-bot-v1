const fs = require('fs');

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + texts.command_help_text, texts.command_help_title);
}