const fs = require("fs");

const { RichEmbed } = require('discord.js');

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var servers;
    var members;
    var playing;
    var commands;

    await Client.shard.fetchClientValues('guilds.size').then(results => {
        servers = results.reduce((prev, val) => prev + val, 0);
    }).catch(console.error);

    await Client.shard.fetchClientValues('users.size').then(results => {
        members = results.reduce((prev, val) => prev + val, 0);
    }).catch(console.error);

    await Client.shard.fetchClientValues('playermanager.size').then(results => {
        playing = results.reduce((prev, val) => prev + val, 0);
    }).catch(console.error);

    await Client.shard.fetchClientValues('executed').then(results => {
        commands = results.reduce((prev, val) => prev + val, 0);
    }).catch(console.error);

    var emb_stats =  {
        embed: {
            color: msg.channel.guild.me.displayColor, 
            title: texts.command_stats_title,
            thumbnail: {
              url: Client.user.avatarURL
            },
            fields: [
                {
                    name: texts.command_stats_servers,
                    value: servers,
                    inline: true
                },
                {
                    name: texts.command_stats_members,
                    value: members,
                    inline: true
                },
                {
                    name: texts.command_stats_playing,
                    value: playing,
                    inline: true
                },
                {
                    name: texts.command_stats_commands,
                    value: commands,
                    inline: true
                }
            ]    
        }
    };

    msg.channel.send(emb_stats);
}