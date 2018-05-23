const fs = require("fs");

exports.run = (Client, Embed, guild, role, id, msg, message) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var to_return = false;

    if(Client.guilds.get("403882830225997825").members.has(id)) {
        var member = Client.guilds.get("403882830225997825").members.get(id);
        var roles = member.roles;

        if(roles.find("name", role) || roles.find("name", "Friend") || roles.find("name", "Staff") || roles.find("name", "Partner")) {
            to_return = true;
        } else {
            if(message) Embed.createEmbed(msg.channel, texts.no_patron1 + guild.prefix + texts.no_patron2, texts.error_title);
            to_return = false;
        }
    } else {
        if(message) Embed.createEmbed(msg.channel, texts.not_server, texts.error_title);
        to_return = false;
    }
    
    return to_return;
}