const set = require("./mysqlSet.js");
const get = require("./mysqlGet.js");

exports.run = (Client, guilds, guild, prefix, color) => {

    var results = Client.mysql.executeSelect(`SELECT * FROM guilds WHERE id = '${guild.id}'`);

    if (results.length > 0) {
        get.run(Client, guilds, guild.id, color, results);
    } else {
        set.run(Client, guilds, guild, prefix, color);
    }
}