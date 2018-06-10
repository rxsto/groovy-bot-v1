const fs = require("fs");

const commandlist = require("../list/commandList.js");

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);
    var jsaliases = commandlist.list;
    var jsaliases_length = Object.keys(jsaliases).length;

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var last_command;

    var message = "";

    await Object.keys(jsaliases).forEach(async alias => {
        createMessage(jsaliases[alias].split(".")[0], alias);
    });

    function createMessage(command, alias) {
        if(command == last_command) {
            message += " `" + alias + "`";
        } else {
            if(command != "help") message += "\n";
            message += "▫ `" + command + "` : `" + alias + "`";
        }
        last_command = command;
    }

    Client.functions.createEmbed(msg.channel, message, "Aliases");
}