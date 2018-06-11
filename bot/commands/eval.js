const fs = require("fs");
const snekfetch = require("snekfetch");

module.exports.run = async (Client, msg, args) => {

    if(msg.author.id != "254892085000405004") return;

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var code = args.join(" ");

    try {
        let ev = require('util').inspect(eval(code));
        if (ev.length > 1950) {
            ev = ev.substr(0, 1950);
        }
        let token = Client.token.replace(/\./g, "\.");
        let re = new RegExp(token, 'g');
        ev = ev.replace(re, "*R-eD-Ac-Te-D-*");
        msg.channel.send("**Input:**```js\n"+code+"```**Eval:**```js\n"+ev+"```");
    } catch(err) {
        msg.channel.send('```js\n'+err+"```");
    }
}