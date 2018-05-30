const fs = require("fs");

const { RichEmbed, ReactionCollector, MessageCollector } = require('discord.js');

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var emb =  {
        embed: {
            color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
            fields: [
                {
                    name: ":exclamation: " + texts.prefix,
                    value: "`" + guild.prefix + "`",
                    inline: true
                },
                {
                    name: ":notes: " + texts.queue_length,
                    value: "`" + guild.queueLength + "`",
                    inline: true
                },
                {
                    name: ":headphones: " + texts.dj_mode,
                    value: "`" + guild.djMode + "`",
                    inline: true
                },
                {
                    name: ":mega: " + texts.announce_songs,
                    value: "`" + guild.announceSongs + "`",
                    inline: true
                },
                {
                    name: ":loud_sound: " + texts.default_volume,
                    value: "`" + guild.defaultVolume + "`",
                    inline: true
                },
                {
                    name: ":microphone: " + texts.dj_role,
                    value: "`" + guild.djRole + "`",
                    inline: true
                },
                {
                    name: texts.settings_help_internal_title,
                    value: texts.settings_help_internal_text,
                    inline: false
                }
            ]    
        }
    };
    
    msg.channel.send(emb).then(async message => {

        if(!msg.guild.me.permissionsIn(msg.channel).has("ADD_REACTIONS")) return;

        await resetReactions(message);

        const reaction_filter = (reaction, user) => reaction.emoji.name === "❗" || reaction.emoji.name === "🎶" || reaction.emoji.name === "🎧" || reaction.emoji.name === "📣" || reaction.emoji.name === "🔊" || reaction.emoji.name === "🎤";

        guild.collector = new ReactionCollector(message, reaction_filter, { time: 600000 });
        
        guild.collector.on("collect", async r => {

            if(!msg.member.hasPermission("MANAGE_GUILD")) return Client.functions.createEmbed(msg.channel, texts.no_manage_permissions, texts.error_title);

            switch(r.emoji.name) {
                case "❗":

                await clearReaction(r);
                guild.collector.stop();

                msg.channel.send(texts.settings_prefix_change).then(async collected_message => {
                    const message_filter = m => m.channel == msg.channel;
                    guild.collector = await msg.channel.createMessageCollector(message_filter);
    
                    guild.collector.on("collect", async m => {
                        if(m.author == Client.user) return;

                        if(m.content.length > 10) {
                            await message.clearReactions();
                            await guild.collector.stop();
                            return await collected_message.edit(texts.prefix_error);
                        }

                        if(m.content.includes("'")) return Client.functions.createEmbed(msg.channel, texts.error_unwanted_char + "`'`", texts.error_title);

                        guild.prefix = m.content;
                        await collected_message.edit(texts.settings_prefix_success + " `" + m.content + "`");

                        await m.delete();

                        var new_emb =  {
                            embed: {
                                color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
                                fields: [
                                    {
                                        name: ":exclamation: " + texts.prefix,
                                        value: "`" + guild.prefix + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":notes: " + texts.queue_length,
                                        value: "`" + guild.queueLength + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":headphones: " + texts.dj_mode,
                                        value: "`" + guild.djMode + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":mega: " + texts.announce_songs,
                                        value: "`" + guild.announceSongs + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":loud_sound: " + texts.default_volume,
                                        value: "`" + guild.defaultVolume + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":microphone: " + texts.dj_role,
                                        value: "`" + guild.djRole + "`",
                                        inline: true
                                    },
                                    {
                                        name: texts.settings_help_internal_title,
                                        value: texts.settings_help_internal_text,
                                        inline: false
                                    }
                                ]    
                            }
                        }; 

                        await message.edit(new_emb);
                        await message.clearReactions();
                        await guild.collector.stop();

                        Client.mysql.executeQuery(`UPDATE guilds SET prefix = '${m.content}' WHERE id = '${msg.guild.id}'`);
                    });
                });

                break;


                case "🎶":

                await clearReaction(r);
                guild.collector.stop();

                msg.channel.send(texts.settings_queue_change).then(async collected_message => {
                    const message_filter = m => m.channel == msg.channel;
                    guild.collector = await msg.channel.createMessageCollector(message_filter);
    
                    guild.collector.on("collect", async m => {
                        if(m.author == Client.user) return;

                        if(isNaN(parseInt(m.content))) return await collected_message.edit(texts.no_number);
                        if(parseInt(m.content) < 1 || parseInt(m.content) > 50) {
                            await message.clearReactions();
                            await guild.collector.stop();
                            return await collected_message.edit(texts.queue_length_error);
                        }
                        guild.queueLength = parseInt(m.content);
                        Client.mysql.executeQuery(`UPDATE guilds SET queueLength = '${m.content}' WHERE id = '${msg.guild.id}'`);
                        await collected_message.edit(texts.settings_queue_length_success + " `" + m.content + "`");

                        await m.delete();

                        var new_emb =  {
                            embed: {
                                color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
                                fields: [
                                    {
                                        name: ":exclamation: " + texts.prefix,
                                        value: "`" + guild.prefix + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":notes: " + texts.queue_length,
                                        value: "`" + guild.queueLength + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":headphones: " + texts.dj_mode,
                                        value: "`" + guild.djMode + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":mega: " + texts.announce_songs,
                                        value: "`" + guild.announceSongs + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":loud_sound: " + texts.default_volume,
                                        value: "`" + guild.defaultVolume + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":microphone: " + texts.dj_role,
                                        value: "`" + guild.djRole + "`",
                                        inline: true
                                    },
                                    {
                                        name: texts.settings_help_internal_title,
                                        value: texts.settings_help_internal_text,
                                        inline: false
                                    }
                                ]    
                            }
                        }; 

                        await message.edit(new_emb);
                        await message.clearReactions();
                        await guild.collector.stop();
                    });
                });

                break;


                case "🎧":

                await clearReaction(r);
                guild.collector.stop();

                msg.channel.send(texts.settings_mode_change).then(async collected_message => {
                    const message_filter = m => m.channel == msg.channel;
                    guild.collector = await msg.channel.createMessageCollector(message_filter);
    
                    guild.collector.on("collect", async m => {
                        if(m.author == Client.user) return;
                        
                        if(m.content == "true" || m.content == "on") {
                            guild.djMode = true;
                            Client.mysql.executeQuery(`UPDATE guilds SET djMode = '1' WHERE id = '${msg.guild.id}'`);
                        } else if(m.content == "false" || m.content == "off") {
                            guild.djMode = false;
                            Client.mysql.executeQuery(`UPDATE guilds SET djMode = '0' WHERE id = '${msg.guild.id}'`);
                        } else {
                            await message.clearReactions();
                            await guild.collector.stop();
                            return await collected_message.edit(texts.wrong_args);
                        }

                        await collected_message.edit(texts.settings_mode_success + " `" + m.content + "`");

                        await m.delete();

                        var new_emb =  {
                            embed: {
                                color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
                                fields: [
                                    {
                                        name: ":exclamation: " + texts.prefix,
                                        value: "`" + guild.prefix + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":notes: " + texts.queue_length,
                                        value: "`" + guild.queueLength + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":headphones: " + texts.dj_mode,
                                        value: "`" + guild.djMode + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":mega: " + texts.announce_songs,
                                        value: "`" + guild.announceSongs + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":loud_sound: " + texts.default_volume,
                                        value: "`" + guild.defaultVolume + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":microphone: " + texts.dj_role,
                                        value: "`" + guild.djRole + "`",
                                        inline: true
                                    },
                                    {
                                        name: texts.settings_help_internal_title,
                                        value: texts.settings_help_internal_text,
                                        inline: false
                                    }
                                ]    
                            }
                        }; 

                        await message.edit(new_emb);
                        await message.clearReactions();
                        await guild.collector.stop();
                    });
                });

                break;


                case "📣":

                await clearReaction(r);
                guild.collector.stop();

                msg.channel.send(texts.settings_mode_change).then(async collected_message => {
                    const message_filter = m => m.channel == msg.channel;
                    guild.collector = await msg.channel.createMessageCollector(message_filter);
    
                    guild.collector.on("collect", async m => {
                        if(m.author == Client.user) return;

                        if(m.content == "true" || m.content == "on") {
                            guild.announceSongs = true;
                            Client.mysql.executeQuery(`UPDATE guilds SET announceSongs = '1' WHERE id = '${msg.guild.id}'`);
                        } else if(m.content == "false" || m.content == "off") {
                            guild.announceSongs = false;
                            Client.mysql.executeQuery(`UPDATE guilds SET announceSongs = '0' WHERE id = '${msg.guild.id}'`);
                        } else {
                            return await collected_message.edit(texts.wrong_args);
                        }

                        await collected_message.edit(texts.settings_mode_success + " `" + m.content + "`");

                        await m.delete();

                        var new_emb =  {
                            embed: {
                                color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
                                fields: [
                                    {
                                        name: ":exclamation: " + texts.prefix,
                                        value: "`" + guild.prefix + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":notes: " + texts.queue_length,
                                        value: "`" + guild.queueLength + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":headphones: " + texts.dj_mode,
                                        value: "`" + guild.djMode + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":mega: " + texts.announce_songs,
                                        value: "`" + guild.announceSongs + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":loud_sound: " + texts.default_volume,
                                        value: "`" + guild.defaultVolume + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":microphone: " + texts.dj_role,
                                        value: "`" + guild.djRole + "`",
                                        inline: true
                                    },
                                    {
                                        name: texts.settings_help_internal_title,
                                        value: texts.settings_help_internal_text,
                                        inline: false
                                    }
                                ]    
                            }
                        }; 

                        await message.edit(new_emb);
                        await message.clearReactions();
                        await guild.collector.stop();
                    });
                });

                break;


                case "🔊":

                await clearReaction(r);
                guild.collector.stop();

                msg.channel.send(texts.settings_volume_change).then(async collected_message => {
                    const message_filter = m => m.channel == msg.channel;
                    guild.collector = await msg.channel.createMessageCollector(message_filter);
    
                    guild.collector.on("collect", async m => {
                        if(m.author == Client.user) return;

                        if(isNaN(parseInt(m.content))) return await collected_message.edit(texts.no_number);
                        if(parseInt(m.content) < 1 || parseInt(m.content) > 100) {
                            await message.clearReactions();
                            await guild.collector.stop();
                            return await collected_message.edit(texts.volume_length_error);
                        }
                        guild.defaultVolume = parseInt(m.content);
                        Client.mysql.executeQuery(`UPDATE guilds SET defaultVolume = '${m.content}' WHERE id = '${msg.guild.id}'`);
                        await collected_message.edit(texts.settings_volume_length_success + " `" + m.content + "`");

                        await m.delete();

                        var new_emb =  {
                            embed: {
                                color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
                                fields: [
                                    {
                                        name: ":exclamation: " + texts.prefix,
                                        value: "`" + guild.prefix + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":notes: " + texts.queue_length,
                                        value: "`" + guild.queueLength + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":headphones: " + texts.dj_mode,
                                        value: "`" + guild.djMode + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":mega: " + texts.announce_songs,
                                        value: "`" + guild.announceSongs + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":loud_sound: " + texts.default_volume,
                                        value: "`" + guild.defaultVolume + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":microphone: " + texts.dj_role,
                                        value: "`" + guild.djRole + "`",
                                        inline: true
                                    },
                                    {
                                        name: texts.settings_help_internal_title,
                                        value: texts.settings_help_internal_text,
                                        inline: false
                                    }
                                ]    
                            }
                        }; 

                        await message.edit(new_emb);
                        await message.clearReactions();
                        await guild.collector.stop();
                    });
                });

                break;


                case "🎤":

                await clearReaction(r);
                guild.collector.stop();

                msg.channel.send(texts.settings_role_change).then(async collected_message => {
                    const message_filter = m => m.channel == msg.channel;
                    guild.collector = await msg.channel.createMessageCollector(message_filter);
    
                    guild.collector.on("collect", async m => {
                        if(m.author == Client.user) return;

                        if(m.content.length > 25) return await collected_message.edit(texts.settings_role_to_long);
                        Client.mysql.executeQuery(`UPDATE guilds SET djRole = '${m.content}' WHERE id = '${msg.guild.id}'`);
                        guild.djRole = m.content;

                        await collected_message.edit(texts.settings_role_success + " `" + m.content + "`");

                        await m.delete();

                        var new_emb =  {
                            embed: {
                                color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
                                fields: [
                                    {
                                        name: ":exclamation: " + texts.prefix,
                                        value: "`" + guild.prefix + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":notes: " + texts.queue_length,
                                        value: "`" + guild.queueLength + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":headphones: " + texts.dj_mode,
                                        value: "`" + guild.djMode + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":mega: " + texts.announce_songs,
                                        value: "`" + guild.announceSongs + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":loud_sound: " + texts.default_volume,
                                        value: "`" + guild.defaultVolume + "`",
                                        inline: true
                                    },
                                    {
                                        name: ":microphone: " + texts.dj_role,
                                        value: "`" + guild.djRole + "`",
                                        inline: true
                                    },
                                    {
                                        name: texts.settings_help_internal_title,
                                        value: texts.settings_help_internal_text,
                                        inline: false
                                    }
                                ]    
                            }
                        }; 

                        await message.edit(new_emb);
                        await message.clearReactions();
                        await guild.collector.stop();
                    });
                });

                break;

                default:
                return;
            }
        });
    });

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
    
        await msg_to_reset.react('❗');
        await msg_to_reset.react('🎶');
        await msg_to_reset.react('🎧');
        await msg_to_reset.react('📣');
        await msg_to_reset.react('🔊');
        await msg_to_reset.react('🎤');

        await message_to_delete.delete();
    }
}