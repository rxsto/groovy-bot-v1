const ytdl = require("ytdl-core");
const fs = require("fs");

const Embed = require("../util/createEmbed.js");
const setPosition = require("../util/setPosition.js");

const commandFilePlaySong = require("./playSong");
const getInfo = require("./getInfo.js");
const setLoopQueue = require("../util/setLoopQueue.js");

var curr_process;
var vc;

exports.run = (Client, guilds, Embed, msg, args) => {
    exports.pauseProcessInterval = function() {
        clearInterval(curr_process);
    }

    exports.resumeProcessInterval = function() {
        curr_process = setInterval(function(){ guilds[msg.guild.id].process++ }, 1000);
    }

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(guilds[msg.guild.id].voicechannel) {
        vc = guilds[msg.guild.id].voicechannel;
    } else {
        if(msg.member.voiceChannel) {
            vc = msg.member.voiceChannel;
        } else {
            Embed.createEmbed(msg.channel, texts.no_channel, texts.error_title);
            return;
        }
    }

    setPosition.run(Client, guilds, Embed, msg, args);

    try {
        stream = ytdl("http://www.youtube.com/watch?v=" + guilds[msg.guild.id].queue[0], {audioonly: true, begin: "" + (guilds[msg.guild.id].process * 1000)});
    } catch (error) {
        Embed.createEmbed(msg.channel, texts.error_occurred + "\n\n" + error, texts.error_title);
        console.log(error);
        return;
    }

    const permissions = vc.permissionsFor(msg.guild.me);
    if (!permissions.has("CONNECT")) {
        return Embed.createEmbed(msg.channel, texts.no_perms_connect, texts.error_title);
    } else if (!permissions.has("SPEAK")) {
        return Embed.createEmbed(msg.channel, texts.no_perms_speak, texts.error_title);
    }

    try {
        vc.join().then(connection => {
            guilds[msg.guild.id].vconnection = connection;
    
            setTimeout(() => {
                curr_process = setInterval(function(){ guilds[msg.guild.id].process++ }, 1000);
                guilds[msg.guild.id].dispatcher = guilds[msg.guild.id].vconnection.playStream(stream);
                guilds[msg.guild.id].isPlaying = true;

                getInfo.run(Client, guilds, Embed, msg, args, guilds[msg.guild.id].queue[0]);
        
                var volume = guilds[msg.guild.id].defaultVolume / 100;
                guilds[msg.guild.id].dispatcher.setVolume(volume);
    
                if(guilds[msg.guild.id].announceSongs) {
                    Embed.createEmbed(msg.channel, ":musical_note: " + guilds[msg.guild.id].named_queue[0], texts.audio_playsong_now_playing);
                }
        
                guilds[msg.guild.id].dispatcher.on('debug', info => {
                    console.log(info);
                });
            
                guilds[msg.guild.id].dispatcher.on('error', error => {
                    Embed.createEmbed(msg.channel, texts.error_occurred + "\n\n" + error, texts.error_title);
                    console.log(error);
                });
            
                guilds[msg.guild.id].dispatcher.on('end', () => {
                    clearInterval(curr_process);
        
                    if(!guilds[msg.guild.id].isSeeking) {
                        guilds[msg.guild.id].process = 0;
                    }
        
                    if(!guilds[msg.guild.id].queue[0]) {
                        guilds[msg.guild.id].isPlaying = false;
                        if(vc.id == "404312098970140672") {
                            let channel = Client.channels.get('404312098970140672');
                            channel.leave();
                            channel.join().then(connection => { guilds[msg.guild.id].vconnection = connection });
                        } else {
                            vc.leave();
                        }
                    }
        
                    if(guilds[msg.guild.id].loopSong) {
                        play();
                    } else if(guilds[msg.guild.id].loopQueue) {
                        setLoopQueue.run(Client, guilds, Embed, msg, args);
                        play();
                    } else if(guilds[msg.guild.id].isSeeking) {
                        play();
                    } else {
                        guilds[msg.guild.id].queue.shift();
                        guilds[msg.guild.id].named_queue.shift();
        
                        if(guilds[msg.guild.id].queue[0]) {
                            commandFilePlaySong.run(Client, guilds, Embed, msg, args);
                        } else {
                            guilds[msg.guild.id].isPlaying = false;
                            if(vc.id == "404312098970140672") {
                                let channel = Client.channels.get('404312098970140672');
                                channel.leave();
                                channel.join().then(connection => { guilds[msg.guild.id].vconnection = connection });
                            } else {
                                vc.leave();
                            }
                        }
                    }
                });
            }, 1000);        
        });        
    } catch (error) {        
        Embed.createEmbed(msg.channel, error.message, texts.error_title);
    }

    function play() {
        if(guilds[msg.guild.id].queue[0]) {
            commandFilePlaySong.run(Client, guilds, Embed, msg, args);
        }
    }
}