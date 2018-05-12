const fs = require("fs");

module.exports.run = (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    Embed.createEmbed(msg.channel, texts.shard_text1 + Client.shard.id + " - " + texts.shard_text2 + Client.shard.count, texts.shard_title);
}