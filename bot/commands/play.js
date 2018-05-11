const fs = require('fs');

const { get } = require('snekfetch');

const getSong = require("../audio/getSong.js");
const isPatron = require("../util/isPatron.js");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

module.exports.run = async (Client, guilds, Embed, msg, args) => {

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    var vc = msg.member.voiceChannel;
    var search = args.join(" ");

    if (!vc) return Embed.createEmbed(msg.channel, texts.no_channel, texts.error_title);

    if(guilds[msg.guild.id].isPaused) {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        await player.pause(false);
        guilds[msg.guild.id].isPaused = false;
        return Embed.createEmbed(msg.channel, texts.resumed_text, texts.resumed_title);        
    }
    
    if (!args[0]) return Embed.createEmbed(msg.channel, texts.no_arguments, texts.error_title);

    if (!vc.joinable) return Embed.createEmbed(msg.channel, texts.no_perms_connect, texts.error_title);
    if (!vc.speakable) return Embed.createEmbed(msg.channel, texts.no_perms_speak, texts.error_title);

    var url;
    var track;
    var song;

    try {
        if(validURL(args.join(" "))) {
            url = encodeURIComponent(args.join(" "));

            const playlist = /(\?|\&)list=(.*)/.exec(args.join(" "));
            const YTMini = /https:\/\/?(www\.)?youtu\.be\/?(.*)/.exec(url);
            const YTFull = /https:\/\/?(www\.)?youtube\.com\/watch\?v=?(.*)/.exec(url);
    
            const soundCloud = /https:\/\/soundcloud\.com\/.*/.exec(url);
            const scPlaylist = /https:\/\/?soundcloud.com\/.*\/.*\/.*/.exec(args.join(" "));
    
            if(playlist) {
                const { body } = await get(`https://www.googleapis.com/youtube/v3/playlists?part=id,snippet&id=${playlist[2]}&key=${config.KEY}`);
                if (!body.items[0]) return Embed.createEmbed(msg.channel, texts.error_nothing_found, texts.error_title);
                const songData = await getSong.run(args.join(" "));
                if (!songData) return Embed.createEmbed(msg.channel, texts.error_nothing_found, texts.error_title);
                var limit;
                limit = 25;
                if(isPatron.run(Client, Embed, guilds, "Donator", msg.author.id, msg) == true) limit = 50;
                if(isPatron.run(Client, Embed, guilds, "Super Donator", msg.author.id, msg) == true) limit = 100;
                if(isPatron.run(Client, Embed, guilds, "Special", msg.author.id, msg) == true) limit = 150;
                if(isPatron.run(Client, Embed, guilds, "Insane", msg.author.id, msg) == true) limit = 1000;

                if(songData.length >= limit) return Embed.createEmbed(msg.channel, texts.not_whole_playlist, texts.error_title);

                if(songData.length >= limit) {
                    limit = limit;
                } else {
                    limit = songData.length;
                }

                Embed.createEmbed(msg.channel, texts.playlist_added_successfully_text, texts.playlist_added_successfully_title);

                for (let i = 0; i <= limit; i++) {
                    await handle(songData[i], true);
                }                
            } else if(YTFull) {
                song = await getSong.run(YTFull[0]);
                await handle(song[0], false);            
            } else if(YTMini) {
                song = await getSong.run(YTMini[0]);
                await handle(song[0], false);               
            } else if(soundCloud) {
                Embed.createEmbed(msg.channel, "Not available yet!", texts.error_title);
            } else if(scPlaylist) {
                Embed.createEmbed(msg.channel, "Not available yet!", texts.error_title);
            } else {
                track = args.join(" ");
                song = await getSong.run("ytsearch: " + track);
                await handle(song[0], false);
            }
         } else {
            track = args.join(" ");
            song = await getSong.run("ytsearch: " + track);
            await handle(song[0], false);
        }
    } catch (error) {
        console.log(error);
    }    

    async function handle(song, playlist) {
        if(!song.info) return;
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
            var maximum = guilds[msg.guild.id].queueLength;
            if(isPatron.run(Client, Embed, guilds, "Donator", msg.author.id, msg, false) == true) maximum = 100;
            if(isPatron.run(Client, Embed, guilds, "Super Donator", msg.author.id, msg, false) == true) maximum = 150;
            if(isPatron.run(Client, Embed, guilds, "Special", msg.author.id, msg, false) == true) maximum = 200;
            if(isPatron.run(Client, Embed, guilds, "Insane", msg.author.id, msg, false) == true) maximum = 1000;
    
            if(guilds[msg.guild.id].queue.length >= maximum) return Embed.createEmbed(msg.channel, texts.queue_to_long, texts.error_title);
    
            guilds[msg.guild.id].queue.push(song);
            if(playlist == false) Embed.createEmbed(msg.channel, ":musical_note: " + texts.audio_your_song + " **" + song.info.title + "** " + texts.audio_getid_added_queue_text, texts.audio_getid_added_queue);
        }
    }

    function play() {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        player.play(guilds[msg.guild.id].queue[0].track);
        guilds[msg.guild.id].isPlaying = true;
        guilds[msg.guild.id].interval = setInterval(function(){ guilds[msg.guild.id].process++ }, 1000);

        if(guilds[msg.guild.id].announceSongs) {
            if(guilds[msg.guild.id].loopSong == false && guilds[msg.guild.id].loopQueue == false) {
                Embed.createEmbed(msg.channel, ":musical_note: " + texts.audio_playsong_now_playing_text1 + guilds[msg.guild.id].queue[0].info.title + texts.audio_playsong_now_playing_text2, texts.audio_playsong_now_playing_title);
            }            
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

    function validURL(str) {
        const regexp = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
        if (!regexp.test(str)) {
            return false;
        } else { return true; }
    };
}