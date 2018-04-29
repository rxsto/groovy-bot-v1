const { RichEmbed, ReactionCollector } = require('discord.js');

const fs = require("fs");

let fileResume = require("./resume.js");
let filePause = require("./pause.js");
let fileStop = require("./stop.js");
let fileSkip = require("./skip.js");
let fileLoopqueue = require("./loopqueue.js");
let fileLoop = require("./loop.js");
let fileShuffle = require("./shuffle.js");

var interval;
var collector;

var reactions = {
    playpause: "⏯",
    stop: "⏹",
    skip: "⏭",
    loopqueue: "🔁",
    loop: "🔂",
    shuffle: "🔀"
}

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(!guilds[msg.guild.id].queue[0]) {
        Embed.createEmbed(msg.channel, texts.np_nothing, texts.np_title);
        return;
    }

    var pr = guilds[msg.guild.id].process;
    var ln = (guilds[msg.guild.id].queue[0].info.length / 1000);
    var go = (pr / ln) * 10;

    var percentage = Math.floor(go);


    var stopped_embed = new RichEmbed();

    stopped_embed.setDescription(texts.np_nothing);
    stopped_embed.setTitle(texts.np_title);
    stopped_embed.setColor(msg.guild.me.highestRole.color);

    var playing_embed = new RichEmbed();

    playing_embed.setDescription(((!guilds[msg.guild.id].isPaused ? ":arrow_forward: " : ":pause_button: ") + getpercentage(percentage) + " `[" + new Date(guilds[msg.guild.id].process * 1000).toISOString().substr(11, 8) + "/" + new Date(guilds[msg.guild.id].queue[0].info.length).toISOString().substr(11, 8) + "]`"  + (guilds[msg.guild.id].loopSong ? " :repeat_one:" : "") + (guilds[msg.guild.id].loopQueue ? " :repeat:" : "") + (guilds[msg.guild.id].isShuffling ? " :twisted_rightwards_arrows:" : "") + " :loud_sound:"));
    playing_embed.setTitle(guilds[msg.guild.id].queue[0].info.title);
    playing_embed.setColor(msg.guild.me.highestRole.color);


    msg.channel.send('', playing_embed).then(async (message) => {
        if(interval) { try { clearInterval(interval); } catch (error) { console.log(error); } }

        const reaction_filter = (reaction) => reaction.emoji.name === reactions.playpause || reaction.emoji.name === reactions.stop || reaction.emoji.name === reactions.skip || reaction.emoji.name === reactions.loopqueue || reaction.emoji.name === reactions.loop || reaction.emoji.name === reactions.shuffle;
        collector = new ReactionCollector(message, reaction_filter);

        var message_warning;
        msg.channel.send(texts.np_setting_emojis).then((m) => {
            message_warning = m;
        });

        await message.clearReactions();
        await message.react(reactions.playpause);
        await message.react(reactions.stop);
        await message.react(reactions.skip);
        await message.react(reactions.loop);
        await message.react(reactions.loopqueue);
        await message.react(reactions.shuffle);

        await message_warning.delete();

        collector.on("collect", async reaction => {
            const player = Client.playermanager.get(msg.guild.id);
            if (!player) return;

            switch(reaction.emoji.name) {
                case reactions.playpause:
                    if(guilds[msg.guild.id].isPaused) {
                        fileResume.run(Client, guilds, Embed, msg, args, false);
                    } else {
                        filePause.run(Client, guilds, Embed, msg, args, false);
                    }
                    break;

                case reactions.stop:
                    fileStop.run(Client, guilds, Embed, msg, args, false);
                    break;

                case reactions.skip:
                    fileSkip.run(Client, guilds, Embed, msg, args, false);
                    break;                            
                
                case reactions.loopqueue:
                    fileLoopqueue.run(Client, guilds, Embed, msg, args, false);
                    break;
                
                case reactions.loop:
                    fileLoop.run(Client, guilds, Embed, msg, args, false);
                    break;
                
                case reactions.shuffle:
                    fileShuffle.run(Client, guilds, Embed, msg, args, false);
                    break;

                default:
                    return;
            }

            clearReaction(reaction);
        });

        interval = setInterval( () => {
            if(!guilds[msg.guild.id].queue[0]) {
                clearInterval(interval);
                message.edit("", stopped_embed);
                message.clearReactions();
            } else {
                var pr = guilds[msg.guild.id].process;
                var ln = (guilds[msg.guild.id].queue[0].info.length / 1000);
                var go = (pr / ln) * 10;
                var percentage = Math.floor(go);

                var second_embed = new RichEmbed();
            
                second_embed.setDescription(((!guilds[msg.guild.id].isPaused ? ":arrow_forward: " : ":pause_button: ") + getpercentage(percentage) + " `[" + new Date(guilds[msg.guild.id].process * 1000).toISOString().substr(11, 8) + "/" + new Date(guilds[msg.guild.id].queue[0].info.length).toISOString().substr(11, 8) + "]`"  + (guilds[msg.guild.id].loopSong ? " :repeat_one:" : "") + (guilds[msg.guild.id].loopQueue ? " :repeat:" : "") + (guilds[msg.guild.id].isShuffling ? " :twisted_rightwards_arrows:" : "") + " :loud_sound:"));
                second_embed.setTitle(guilds[msg.guild.id].queue[0].info.title);
                second_embed.setColor(msg.guild.me.highestRole.color);

                message.edit("", second_embed);
            }        
        }, 5000);
    });

    function checkUsers(reaction) {
        reaction.fetchUsers().then((users) => {
            user_array = users.array();

            user_array.forEach(user => {
                console.log(user.id + " + " + msg.guild.me.user.id);
                if(user.id == msg.guild.me.user.id) {
                    return true;
                } else {
                    return false;
                }
            });
        });
    }

    function clearReaction(reaction) {
        reaction.fetchUsers().then((users) => {
            user_array = users.array();

            user_array.forEach(user => {
                if(user.id != msg.guild.me.user.id) {
                    reaction.remove(user);
                }
            });
        });
    }

    async function resetReactions(msg) {
        var message;
        msg.channel.send(texts.np_setting_emojis).then((m) => {
            message = m;
        });

        await msg.clearReactions();
        await msg.react(reactions.playpause);
        await msg.react(reactions.stop);
        await msg.react(reactions.skip);
        await msg.react(reactions.loop);
        await msg.react(reactions.loopqueue);
        await msg.react(reactions.shuffle);

        await message.delete();
    }

    function getpercentage(percentage) {
        if(percentage == 0) {
            return "🔘▬▬▬▬▬▬▬▬▬";
        } else if(percentage == 1) {
            return "▬🔘▬▬▬▬▬▬▬▬";
        } else if(percentage == 2) {
            return "▬▬🔘▬▬▬▬▬▬▬";
        } else if(percentage == 3) {
            return "▬▬▬🔘▬▬▬▬▬▬";
        } else if(percentage == 4) {
            return "▬▬▬▬🔘▬▬▬▬▬";
        } else if(percentage == 5) {
            return "▬▬▬▬▬🔘▬▬▬▬";
        } else if(percentage == 6) {
            return "▬▬▬▬▬▬🔘▬▬▬";
        } else if(percentage == 7) {
            return "▬▬▬▬▬▬▬🔘▬▬";
        } else if(percentage == 8) {
            return "▬▬▬▬▬▬▬▬🔘▬";
        } else if(percentage == 9) {
            return "▬▬▬▬▬▬▬▬▬🔘";
        } else {
            return "🔘▬▬▬▬▬▬▬▬▬";
        }
    }
}

//Embed.createEmbed(msg.channel, ((!guilds[msg.guild.id].isPaused ? ":arrow_forward: " : ":pause_button: ") + getpercentage(percentage) + " `[" + new Date(guilds[msg.guild.id].process * 1000).toISOString().substr(11, 8) + "/" + new Date(guilds[msg.guild.id].queue[0].info.length).toISOString().substr(11, 8) + "]`"  + (guilds[msg.guild.id].loopSong ? " :repeat_one:" : "") + (guilds[msg.guild.id].loopQueue ? " :repeat:" : "") + (guilds[msg.guild.id].isShuffling ? " :twisted_rightwards_arrows:" : "") + " :loud_sound:"), guilds[msg.guild.id].queue[0].info.title);