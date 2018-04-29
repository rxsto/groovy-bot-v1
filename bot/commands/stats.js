const fs = require("fs");

const { RichEmbed } = require('discord.js');
const Embed = require('../util/createEmbed.js');

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    var servers = Client.guilds.size;

    var playing = 0;
    var connected = 0;

    g = Client.guilds.array();

    g.forEach(guild => {
        if(guild.me.voiceChannel) {
            playing++;
        }
    });

    var members = Client.users.size;
    var channels = Client.channels.size;

    var emb_stats =  {
        embed: {
            color: msg.channel.guild.me.highestRole.color, title: texts.stats_title,
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
                    name: texts.stats_channels,
                    value: channels,
                    inline: true
                }
            ]    
        }
    }; msg.channel.send('', emb_stats);
}