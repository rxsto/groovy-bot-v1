const fs = require('fs');
const { RichEmbed } = require('discord.js');
const main = require("../main.js");

let createHelp = require("../util/createHelp.js");

exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    var help = [];
    
    createHelp.run(help, guilds, msg);

    var emb = new RichEmbed();
    var message;

    msg.channel.send(texts.help_sent + msg.author).then((m) => {
        setTimeout(function () {
            m.delete();
        }, 5000);
    });

    emb.setDescription(help);
    emb.setColor(msg.channel.guild.me.highestRole.color);
    emb.setTitle(texts.help_title);

    try {
        msg.author.send('', emb).then((m) => {
            message = m;
        });        
    } catch (error) {
        console.log(error);
        Embed.createEmbed(msg.channel, error, texts.error_title);
    }
    return message;
}