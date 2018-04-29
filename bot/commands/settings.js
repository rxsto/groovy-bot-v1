const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

const { RichEmbed } = require('discord.js');

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(!args[0]) {
        var emb_stats =  {
            embed: {
                color: msg.channel.guild.me.highestRole.color, title: "Groovy - Settings",
                fields: [
                    {
                        name: ":exclamation: " + texts.prefix,
                        value: "`" + guilds[msg.guild.id].prefix + "`",
                        inline: true
                    },
                    {
                        name: ":notes: " + texts.queue_length,
                        value: "`" + guilds[msg.guild.id].queueLength + "`",
                        inline: true
                    },
                    {
                        name: ":headphones: " + texts.dj_mode,
                        value: "`" + guilds[msg.guild.id].djMode + "`",
                        inline: true
                    },
                    {
                        name: ":mega: " + texts.announce_songs,
                        value: "`" + guilds[msg.guild.id].announceSongs + "`",
                        inline: true
                    },
                    {
                        name: ":loud_sound: " + texts.default_volume,
                        value: "`" + guilds[msg.guild.id].defaultVolume + "`",
                        inline: true
                    },
                    {
                        name: ":microphone: " + texts.dj_role,
                        value: "`" + guilds[msg.guild.id].djRole + "`",
                        inline: true
                    },
                    {
                        name: texts.settings_help_internal_title,
                        value: texts.settings_help_internal_text1 + guilds[msg.guild.id].prefix + texts.settings_help_internal_text2,
                        inline: false
                    }
                ]    
            }
        }; msg.channel.send('', emb_stats);
    } else if(args[0] && !args[1]) {
        switch(args[0]) {
            case "prefix":
            Embed.createEmbed(msg.channel, ":exclamation: " + texts.prefix + ": `" + guilds[msg.guild.id].prefix + "`", texts.prefix);
            break;


            case "length":
            case "queue-length":
            Embed.createEmbed(msg.channel, ":notes: " + texts.queue_length + ": `" + guilds[msg.guild.id].queueLength + "`", texts.prefix);
            break;


            case "mode":
            case "dj":
            case "dj-mode":
            Embed.createEmbed(msg.channel, ":headphones: " + texts.dj_mode + ": `" + guilds[msg.guild.id].djMode + "`", texts.prefix);
            break;


            case "role":
            case "dj-role":
            Embed.createEmbed(msg.channel, ":microphone: " + texts.dj_role + ": `" + guilds[msg.guild.id].djRole + "`", texts.prefix);
            break;


            case "announce":
            case "announce-songs":
            Embed.createEmbed(msg.channel, ":mega: " + texts.announce_songs + ": `" + guilds[msg.guild.id].announceSongs + "`", texts.prefix);
            break;


            case "default":
            case "default-volume":
            Embed.createEmbed(msg.channel, ":loud_sound: " + texts.default_volume + ": `" + guilds[msg.guild.id].defaultVolume + "`", texts.prefix);
            break;


            case "lang":
            case "language":
            Embed.createEmbed(msg.channel, ":capital_abcd: " + texts.language + ": `" + guilds[msg.guild.id].language + "`", texts.prefix);
            break;


            default:
            return;
        }
    } else if(args[1]) {
        if(args[1].includes("'")) {
            Embed.createEmbed(msg.channel, "```'``` is invalid!", texts.error_title);
            return;
        }
        switch(args[0]) {
            case "prefix":
            if(args[1].length > 10) {
                Embed.createEmbed(msg.channel, texts.prefix_error, texts.error_title);
                return;
            }
            Client.mysql.executeQuery(`UPDATE guilds SET prefix = '${args[1]}' WHERE id = '${msg.guild.id}'`);
            guilds[msg.guild.id].prefix = args[1];
            Embed.createEmbed(msg.channel, texts.settings_prefix_success + " `" + args[1] + "`", texts.settings_success);
            break;


            case "length":
            case "queue-length":
            if(isNaN(args[1])) {
                return;
            }
            if(args[1] > 50) {
                Embed.createEmbed(msg.channel, texts.queue_length_error, texts.error_title);
                return;
            }
            Client.mysql.executeQuery(`UPDATE guilds SET queueLength = '${args[1]}' WHERE id = '${msg.guild.id}'`);
            guilds[msg.guild.id].queueLength = args[1];
            Embed.createEmbed(msg.channel, texts.settings_queue_length_success + " `" + args[1] + "`", texts.settings_success);
            break;


            case "mode":
            case "dj":
            case "dj-mode":
            if(args[1] == "true") {
                Client.mysql.executeQuery(`UPDATE guilds SET djMode = '1' WHERE id = '${msg.guild.id}'`);
                guilds[msg.guild.id].djMode = true;
                Embed.createEmbed(msg.channel, texts.settings_dj_mode_success + " `" + args[1] + "`", texts.settings_success);
            } else if(args[1] == "false") {
                Client.mysql.executeQuery(`UPDATE guilds SET djMode = '0' WHERE id = '${msg.guild.id}'`);
                guilds[msg.guild.id].djMode = false;
                Embed.createEmbed(msg.channel, texts.settings_dj_mode_success + " `" + args[1] + "`", texts.settings_success);
            } else {
                return;
            }
            break;


            case "role":
            case "dj-role":
            if(args[1].length > 30) {
                Embed.createEmbed(msg.channel, texts.role_error, texts.error_title);
                return;
            }
            Client.mysql.executeQuery(`UPDATE guilds SET djRole = '${args[1]}' WHERE id = '${msg.guild.id}'`);
            guilds[msg.guild.id].djRole = args[1];
            Embed.createEmbed(msg.channel, texts.settings_role_success + " `" + args[1] + "`", texts.settings_success);
            break;


            case "announce":
            case "announce-songs":
            if(args[1] == "true") {
                Client.mysql.executeQuery(`UPDATE guilds SET announceSongs = '1' WHERE id = '${msg.guild.id}'`);
                guilds[msg.guild.id].announceSongs = true;
                Embed.createEmbed(msg.channel, texts.settings_announce_success + " `" + args[1] + "`", texts.settings_success);
            } else if(args[1] == "false") {
                Client.mysql.executeQuery(`UPDATE guilds SET announceSongs = '0' WHERE id = '${msg.guild.id}'`);
                guilds[msg.guild.id].announceSongs = false;
                Embed.createEmbed(msg.channel, texts.settings_announce_success + " `" + args[1] + "`", texts.settings_success);
            } else {
                return;
            }
            break;


            case "volume":
            case "default-volume":
            if(isNaN(args[1])) {
                return;
            }
            if(args[1] > 100 && args[1] < 1) {
                return;
            }
            Client.mysql.executeQuery(`UPDATE guilds SET defaultVolume = '${args[1]}' WHERE id = '${msg.guild.id}'`);
            guilds[msg.guild.id].defaultVolume = args[1];
            Embed.createEmbed(msg.channel, texts.settings_volume_success + " `" + args[1] + "`", texts.settings_success);
            break;


            case "lang":
            case "language":
            return;
            if(args[1] == "en" || args[1] == "de" || args[1] == "fr" || args[1] == "es") {
                Client.mysql.executeQuery(`UPDATE guilds SET language = '${args[1]}' WHERE id = '${msg.guild.id}'`);
                guilds[msg.guild.id].language = args[1];
                Embed.createEmbed(msg.channel, texts.settings_volume_success + " `" + args[1] + "`", texts.settings_success);
            } else {
                Embed.createEmbed(msg.channel, texts.not_a_language, texts.error_title);
            }
            break;


            default:
            return;
        }
    } else {
        return;
    }
}