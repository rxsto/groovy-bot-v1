const fs = require("fs");

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    Client.functions.createEmbed(msg.channel, Client.emotes.get("info") + texts.command_shard_text_1 + " `" + (Client.shard.id + 1) + "`\n" + Client.emotes.get("point") + texts.command_shard_text_2 + " `" + Client.shard.count + "`", texts.command_shard_title);
}