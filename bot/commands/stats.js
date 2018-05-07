const fs = require("fs");

const { RichEmbed } = require('discord.js');
const Embed = require('../util/createEmbed.js');

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    var servers = Client.guilds.size;
    var members = Client.users.size;
    var connections = Client.playermanager.size;
    
    var playing = 0;
    var players = Client.playermanager.array();
    players.forEach(player => {
        if(player.playing) playing++;
    });

    var emb_stats =  {
        embed: {
            color: msg.channel.guild.me.displayColor, title: texts.stats_title,
            thumbnail: {
              url: Client.user.avatarURL
            },
            fields: [
                {
                    name: texts.stats_servers,
                    value: servers,
                    inline: true
                },
                {
                    name: texts.stats_playing,
                    value: playing,
                    inline: true
                },
                {
                    name: texts.stats_members,
                    value: members,
                    inline: true
                },
                {
                    name: texts.stats_connections,
                    value: connections,
                    inline: true
                }
            ]    
        }
    }; msg.channel.send('', emb_stats);
}