const fs = require("fs");

const play = require("./play.js");

module.exports.run = (Client, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    play.run(Client, msg, args, true, "playskip");
}