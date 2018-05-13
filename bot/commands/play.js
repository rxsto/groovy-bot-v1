const fs = require('fs');

const { get } = require('snekfetch');

const getSong = require("../audio/getSong.js");
const isPatron = require("../util/isPatron.js");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

module.exports.run = async (Client, Embed, msg, args, action) => {

    var guild = Client.servers.get(msg.guild.id);

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var vc = msg.member.voiceChannel;
    var search = args.join(" ");

    if (!vc) return Embed.createEmbed(msg.channel, texts.no_channel, texts.error_title);

    if(guild.isPaused) {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return;
        await player.pause(false);
        guild.isPaused = false;
        return Embed.createEmbed(msg.channel, texts.resumed_text, texts.resumed_title);
    }
    
    if (!args[0]) return Embed.createEmbed(msg.channel, texts.no_arguments, texts.error_title);

    if (!vc.joinable) return Embed.createEmbed(msg.channel, texts.no_perms_connect, texts.error_title);
    if (!vc.speakable) return Embed.createEmbed(msg.channel, texts.no_perms_speak, texts.error_title);
    if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) return;

    var url;
    var track;
    var song;

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
            var limit = 25;
            if(isPatron.run(Client, Embed, guild, "Donator", msg.author.id, msg) == true) limit = 50;
            if(isPatron.run(Client, Embed, guild, "Super Donator", msg.author.id, msg) == true) limit = 100;
            if(isPatron.run(Client, Embed, guild, "Special", msg.author.id, msg) == true) limit = 150;
            if(isPatron.run(Client, Embed, guild, "Insane", msg.author.id, msg) == true) limit = 1000;

            if(songData.length >= limit) Embed.createEmbed(msg.channel, texts.not_whole_playlist, texts.error_title);

            if(songData.length >= limit) {
                limit = limit;
            } else {
                limit = songData.length;
            }

            limit = limit - 1;

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

    async function handle(song, playlist) {
        if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) return;
        if(song == null) return;
        if (!vc.joinable) return Embed.createEmbed(msg.channel, texts.no_perms_connect, texts.error_title);
        const player = await Client.playermanager.join({
            guild: msg.guild.id,
            channel: msg.member.voiceChannelID,
            host: "127.0.0.1"
        });
    
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        
        await player.volume(guild.defaultVolume);
        song.info.member = msg.member;
    
        if(!guild.queue[0]) {
            guild.process = 0;
            guild.queue.push(song);
            await play();
        } else {
            var maximum = guild.queueLength;
            if(isPatron.run(Client, Embed, guild, "Donator", msg.author.id, msg, false) == true) maximum = 100;
            if(isPatron.run(Client, Embed, guild, "Super Donator", msg.author.id, msg, false) == true) maximum = 150;
            if(isPatron.run(Client, Embed, guild, "Special", msg.author.id, msg, false) == true) maximum = 200;
            if(isPatron.run(Client, Embed, guild, "Insane", msg.author.id, msg, false) == true) maximum = 1000;
    
            if(guild.queue.length >= maximum) return Embed.createEmbed(msg.channel, texts.queue_to_long, texts.error_title);
    
            guild.queue.push(song);
            if(playlist == false) Embed.createEmbed(msg.channel, ":musical_note: " + texts.audio_your_song + " **" + song.info.title + "** " + texts.audio_getid_added_queue_text, texts.audio_getid_added_queue);
        }
    }

    async function play() {
        if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) return;
        const player = await Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
        if (!vc.speakable) return Embed.createEmbed(msg.channel, texts.no_perms_speak, texts.error_title);
        await player.play(guild.queue[0].track);
        guild.isPlaying = true;
        guild.interval = setInterval(function(){ guild.process++ }, 1000);

        guild.check = setInterval(async function() {
            var users = 0;
            if(msg.guild.me.voiceChannel == null) return clearInterval(guild.check);
            var members = msg.guild.me.voiceChannel.members.array();

            await members.forEach(member => {
                if(!member.user.bot) users++;
            });

            if(users == 0) {
                if(guild.isPaused) {
                    Client.playermanager.leave(msg.guild.id);
                } else {
                    const player = Client.playermanager.get(msg.guild.id);
                    if (!player) return;
                    await player.pause(true);
                    guild.isPaused = true;
                    clearInterval(guild.interval);
                }
            }
        }, 600000);

        if(guild.announceSongs) {
            if(guild.loopSong == false && guild.loopQueue == false) {
                Embed.createEmbed(msg.channel, ":musical_note: " + texts.audio_playsong_now_playing_text1 + guild.queue[0].info.title + texts.audio_playsong_now_playing_text2, texts.audio_playsong_now_playing_title);
            }            
        }

        player.on("error", console.error);
        player.once("end", async data => {
            if (data.reason === "REPLACED") return;

            await clearInterval(guild.interval);
            await clearInterval(guild.check);

            guild.votes.clear();
            guild.process = 0;

            if(!guild.queue[0]) {
                guild.isPlaying = false;
                await leave();
            } else {
                if(guild.loopSong) {
                    await play();
                } else if(guild.loopQueue) {
                    var len = guild.queue.length;
                    var first = guild.queue[0];
                    guild.queue.shift();
                    guild.queue.push(first);
                    await play();
                } else if(guild.isShuffling) {
                    var len = guild.queue.length;
    
                    if(len < 1) {
                        guild.isPlaying = false;
                        await leave();
                        return;
                    }
    
                    var pos = Math.floor(Math.random() * len);
    
                    var shuffled_id = guild.queue[pos];
                    guild.queue.splice(pos, 1);
                    guild.queue.unshift(shuffled_id);
                } else if(guild.isShuffling && guild.loopQueue) {
                    var len = guild.queue.length;
    
                    if(len < 1) {
                        guild.isPlaying = false;
                        await leave();
                        return;
                    }
    
                    var pos = Math.floor(Math.random() * len);
    
                    var shuffled_id = guild.queue[pos];
                    guild.queue.splice(pos, 1);
                    guild.queue.unshift(shuffled_id);
                } else {
                    guild.queue.shift();
    
                    if(guild.queue[0]) {
                        await play();
                    } else {
                        guild.isPlaying = false;
                        await leave();
                    }
                }
            }            
        });
    }

    async function leave() {
        if(vc.id == "404312098970140672") return;
        await Client.playermanager.leave(msg.guild.id);
        await clearInterval(guild.interval);
        guild.queue = [];
        await guild.votes.clear();
        guild.isPaused = false;
        guild.isPlaying = false;
        guild.process = 0;
    }

    function validURL(str) {
        const regexp = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
        if (!regexp.test(str)) {
            return false;
        } else { return true; }
    };
}