module.exports = async (Client, id) => {
    const Discord = require("discord.js");
    const fs = require("fs");

    const texts = JSON.parse(fs.readFileSync( "./bot/json/lang/en.json", 'utf8'));

    const guild = Client.guilds.get("403882830225997825");
    if(!guild) return;

    const channel = guild.channels.get(id);

    Client.log.info("[Modules] Current-Stats was loaded!");

    var servers;
    var members;
    var playing;
    var commands;   

    setTimeout(async () => {
        await getStats(Client);
        startModule(Client);
    }, 60000);

    async function startModule(Client) {
        await getStats(Client);
        var emb_stats =  {
            embed: {
                color: channel.guild.me.displayColor,
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
    
        channel.send(emb_stats).then(message => {
            setInterval(async () => {
                await getStats(Client);
    
                var new_emb =  {
                    embed: {
                        color: channel.guild.me.displayColor, 
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
    
                message.edit(new_emb);
            }, 600000);
        });
    }

    async function getStats(Client) {
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
    }
}