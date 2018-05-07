const fs = require('fs');

const getSong = require("../audio/getSong.js");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

module.exports.run = async (Client, guilds, Embed, msg, args) => {

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    var vc = msg.member.voiceChannel;
    var search = args.join(" ");

    if(!vc) {
        Embed.createEmbed(msg.channel, texts.no_channel, texts.error_title);
        return;
    }   

    if(guilds[msg.guild.id].isPaused) {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        await player.pause(false);
        guilds[msg.guild.id].isPaused = false;
        Embed.createEmbed(msg.channel, texts.resumed_text, texts.resumed_title);
        return;
    }
    
    if(!args[0]) {
        Embed.createEmbed(msg.channel, texts.no_arguments, texts.error_title);
        return;
    }

    if (!vc.joinable) {
        return Embed.createEmbed(msg.channel, texts.no_perms_connect, texts.error_title);
    } else if (!vc.speakable) {
        return Embed.createEmbed(msg.channel, texts.no_perms_speak, texts.error_title);
    }

    let [...track] = args;
    track = track.join(" ");

    // ADD PLAYLIST AND SOUNDCLOUD SUPPORT
    // https://github.com/AdityaTD/PenguBot/blob/rewrite/commands/Music/play.js
    // WORK WITH REGEX
    
    const [song] = await getSong.run("ytsearch: " + track, config.PASS1);

    const player = await Client.playermanager.join({
        guild: msg.guild.id,
        channel: msg.member.voiceChannelID,
        host: "127.0.0.1"
    });

    if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
    
    player.volume(guilds[msg.guild.id].defaultVolume);
    song.info.member = msg.member;

    if(!guilds[msg.guild.id].queue[0]) {
        guilds[msg.guild.id].process = 0;
        guilds[msg.guild.id].queue.push(song);
        play();
    } else {
        if(guilds[msg.guild.id].queue.length >= guilds[msg.guild.id].queueLength) {
            if(isPatron.run(Client, Embed, guilds, "Donator", msg.author.id, msg) == true && guilds[msg.guild.id].queue.length >= 100) {
                return Embed.createEmbed(msg.channel, texts.queue_to_long, texts.error_title);
            } else if(isPatron.run(Client, Embed, guilds, "Super Donator", msg.author.id, msg) == true && guilds[msg.guild.id].queue.length >= 150) {
                return Embed.createEmbed(msg.channel, texts.queue_to_long, texts.error_title);
            } else if(isPatron.run(Client, Embed, guilds, "Special", msg.author.id, msg) == true && guilds[msg.guild.id].queue.length >= 200) {
                return Embed.createEmbed(msg.channel, texts.queue_to_long, texts.error_title);
            } else if(isPatron.run(Client, Embed, guilds, "Insane", msg.author.id, msg) == true && guilds[msg.guild.id].queue.length >= 1000) {
                return Embed.createEmbed(msg.channel, texts.queue_to_long, texts.error_title);
            } else {
                return Embed.createEmbed(msg.channel, texts.queue_to_long, texts.error_title);
            }
        }
        guilds[msg.guild.id].queue.push(song);
        Embed.createEmbed(msg.channel, ":musical_note: " + texts.audio_your_song + " **" + song.info.title + "** " + texts.audio_getid_added_queue_text, texts.audio_getid_added_queue);
    }

    function play() {
        player.play(guilds[msg.guild.id].queue[0].track);
        guilds[msg.guild.id].isPlaying = true;
        guilds[msg.guild.id].interval = setInterval(function(){ guilds[msg.guild.id].process++ }, 1000);

        if(guilds[msg.guild.id].announceSongs) {
            Embed.createEmbed(msg.channel, ":musical_note: " + texts.audio_playsong_now_playing_text1 + guilds[msg.guild.id].queue[0].info.title + texts.audio_playsong_now_playing_text2, texts.audio_playsong_now_playing_title);
        }

        player.on("error", console.error);
        player.once("end", data => {
            if (data.reason === "REPLACED") return;

            clearInterval(guilds[msg.guild.id].interval);

            guilds[msg.guild.id].votes = 0;
            guilds[msg.guild.id].process = 0;

            if(!guilds[msg.guild.id].queue[0]) {
                guilds[msg.guild.id].isPlaying = false;
                leave();
            } else {
                if(guilds[msg.guild.id].loopSong) {
                    play();
                } else if(guilds[msg.guild.id].loopQueue) {
                    var len = guilds[msg.guild.id].queue.length;
                    var first = guilds[msg.guild.id].queue[0];
                    guilds[msg.guild.id].queue.shift();
                    guilds[msg.guild.id].queue.push(first);
                    play();
                } else if(guilds[msg.guild.id].isShuffling) {
                    var len = guilds[msg.guild.id].queue.length;
    
                    if(len < 1) {
                        guilds[msg.guild.id].isPlaying = false;
                        leave();
                        return;
                    }
    
                    var pos = Math.floor(Math.random() * len);
    
                    var shuffled_id = guilds[msg.guild.id].queue[pos];
                    guilds[msg.guild.id].queue.splice(pos, 1);
                    guilds[msg.guild.id].queue.unshift(shuffled_id);
                } else if(guilds[msg.guild.id].isShuffling && guilds[msg.guild.id].loopQueue) {
                    var len = guilds[msg.guild.id].queue.length;
    
                    if(len < 1) {
                        guilds[msg.guild.id].isPlaying = false;
                        leave();
                        return;
                    }
    
                    var pos = Math.floor(Math.random() * len);
    
                    var shuffled_id = guilds[msg.guild.id].queue[pos];
                    guilds[msg.guild.id].queue.splice(pos, 1);
                    guilds[msg.guild.id].queue.unshift(shuffled_id);
                } else {
                    guilds[msg.guild.id].queue.shift();
    
                    if(guilds[msg.guild.id].queue[0]) {
                        play();
                    } else {
                        guilds[msg.guild.id].isPlaying = false;
                        leave();
                    }
                }
            }            
        });
    }

    function leave() {
        if(vc.id == "404312098970140672") return;
        Client.playermanager.leave(msg.guild.id);
        clearInterval(guilds[msg.guild.id].interval);
        guilds[msg.guild.id].queue = [];
        guilds[msg.guild.id].votes = 0;
        guilds[msg.guild.id].process = 0;
    }
}