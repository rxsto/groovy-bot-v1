const fs = require("fs");

const { RichEmbed, ReactionCollector } = require('discord.js');

module.exports.run = async (Client, Embed, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(guild.djMode) {
        if(msg.member.hasPermission("KICK_MEMBERS", false, true, true)) return skip();
        if(!msg.member.roles.find("name", guild.djRole)) {
            var members = msg.guild.me.voiceChannel.members.size - 1;

            var percentage = Math.floor(guild.votes.size / members);

            if(members == 1) return await skip();

            if(percentage >= 1) {
                await skip();
            } else {
                if(guild.votes.has(msg.author.id)) return Embed.createEmbed(msg.channel, texts.skip_vote_already, texts.error_title);
                guild.votes.set(msg.author.id, msg.author);
                if(Math.floor(guild.votes.size / members) >= 1) return await skip();

                var emb = new RichEmbed();
                emb.setDescription(texts.skip_vote_text + "`" + guild.votes.size + "`!");
                emb.setColor(msg.channel.guild.me.displayColor);
                emb.setTitle(texts.skip_vote_title)

                msg.channel.send(emb).then(async message => {
                    await resetReactions(message);

                    const reaction_filter = (reaction, user) => reaction.emoji.name === "⬆" && msg.guild.members.get(user.id).voiceChannel === msg.guild.me.voiceChannel;

                    guild.collector = new ReactionCollector(message, reaction_filter, { time: 600000 });
                    
                    guild.collector.on("collect", async r => {
                        switch(r.emoji.name) {
                            case "⬆":

                            var user;

                            for (let index = 0; index < message.reactions.first().users.array().length; index++) {
                                if(message.reactions.first().users.array()[index] != Client.user) {
                                    user = message.reactions.first().users.array()[index];
                                }
                            }

                            if(!user) return;

                            await clearReaction(r);

                            if(guild.votes.has(user.id)) return;
                            guild.votes.set(user.id, user);
                            if(Math.floor(guild.votes.size / members) >= 1) {
                                return await skip();
                            } else {
                                var emb = new RichEmbed();        
                                emb.setDescription(texts.skip_vote_text + "`" + guild.votes.size + "`!");
                                emb.setColor(msg.channel.guild.me.displayColor);
                                emb.setTitle(texts.skip_vote_title);
                                message.edit(new_emb);
                            }

                            break;

                            default:
                            return;

                        }
                    });
                });
            }
        } else {
            await skip();
        }
    } else {
        await skip();
    }

    async function skip() {
        if(guild.loopSong) guild.loopSong = false;
        await guild.votes.clear();
        const player = await Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
    
        if(args[0]) {
            if(args[1]) {                
                if(info) {
                    Embed.createEmbed(msg.channel, texts.skip_args, texts.error_title);
                }
            } else {
                var pos = args.join(" ");
                if(!isNaN(pos)) {
                    if(pos > guild.queue.length) {                        
                        if(info) {
                            Embed.createEmbed(msg.channel, texts.skip_shorter, texts.error_title);
                        }
                    } else {
                        var remove = pos - 2;
                        guild.queue.splice(0, remove);
                        guild.process = 0;
                        await player.stop();
                        if(info) {
                            Embed.createEmbed(msg.channel, texts.skip_text + args + ".", texts.skip_title + args + "");
                        }
                    }
                } else {                    
                    if(info) {
                        Embed.createEmbed(msg.channel, texts.no_number, texts.error_title);
                    }
                }
            }
        } else {
            if(!guild.queue[1]) {                
                if(info) {
                    Embed.createEmbed(msg.channel, texts.skip_no_song, texts.error_title);
                }
            } else {
                await player.stop();                
                if(info) {
                    Embed.createEmbed(msg.channel, texts.skip_single_text, texts.skip_single_title);
                }
            }
        }     
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

    async function resetReactions(msg_to_reset) {
        var message_to_delete;
        await msg_to_reset.channel.send(texts.np_setting_emojis).then((m) => {
            message_to_delete = m;
        });

        await msg_to_reset.clearReactions();
    
        await msg_to_reset.react('⬆');

        await message_to_delete.delete();
    }
}