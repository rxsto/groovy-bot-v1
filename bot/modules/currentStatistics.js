const Discord = require("discord.js");
const fs = require("fs");

const Client = process.Client;
const channel = Client.channels.get("449184950495739906");
const guild = Client.guilds.get("403882830225997825");

if(!guild) return;

const texts = JSON.parse(fs.readFileSync( "./bot/json/lang/en.json", 'utf8'));

Client.log.info("[Modules] Current-Stats was loaded!");

setTimeout( () => {

    Client.sharder.fetchClientValues('guilds.size').then(results => {
        console.log(results);
        console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
    }).catch(console.error);

}, 60000);

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
        color: guild.me.displayColor, title: texts.stats_title,
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
};

const fetched = channel.fetchMessages({limit: 99});
if(fetched instanceof Discord.Collection || fetched instanceof Array || !isNaN(fetched)) channel.bulkDelete(fetched);

channel.send(emb_stats).then(message => {
    setInterval( () => {
        var servers = Client.guilds.size;
        var members = Client.users.size;
        var connections = Client.playermanager.size;

        var playing = 0;
        var players = Client.playermanager.array();
        players.forEach(player => {
            if(player.playing) playing++;
        });

        var new_emb =  {
            embed: {
                color: guild.me.displayColor, title: texts.stats_title,
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
        };

        message.edit(new_emb);
    }, 600000);
});