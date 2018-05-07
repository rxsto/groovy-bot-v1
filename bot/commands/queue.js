const fs = require("fs");

const { RichEmbed } = require('discord.js');

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(guilds[msg.guild.id].queue.length <= 0) {
        Embed.createEmbed(msg.channel, texts.queue_nothing, texts.error_title);        
    } else {

        if(!args[0]) {        
            return getQueue(0);
        }
    
        if(isNaN(args[0])) {
            Embed.createEmbed(msg.channel, texts.no_number, texts.error_title);
        }

        switch(args[0]) {
            case "1":
            getQueue(0);
            break;
            case "2":
            if(guilds[msg.guild.id].queue.length < 10) {
                return Embed.createEmbed(msg.channel, texts.queue_nothing_site, texts.error_title);
            }
            getQueue(10);
            break;
            case "3":
            if(guilds[msg.guild.id].queue.length < 20) {
                return Embed.createEmbed(msg.channel, texts.queue_nothing_site, texts.error_title);
            }
            getQueue(20);
            break;
            case "4":
            if(guilds[msg.guild.id].queue.length < 30) {
                return Embed.createEmbed(msg.channel, texts.queue_nothing_site, texts.error_title);
            }
            getQueue(30);
            break;
            case "5":
            if(guilds[msg.guild.id].queue.length < 40) {
                return Embed.createEmbed(msg.channel, texts.queue_nothing_site, texts.error_title);
            }
            getQueue(40);
            break;
            default:
            return;
        }

        
    }

    function getQueue(start) {
        var len = guilds[msg.guild.id].queue.length;

        var sites;
        if(len >= 1 && len <= 10) {
            sites = 1;
        } else if(len >= 11 && len <= 20) {
            sites = 2;
        } else if(len >= 21 && len <= 30) {
            sites = 3;            
        } else if(len >= 31 && len <= 40) {
            sites = 4;            
        } else if(len >= 41 && len <= 50) {
            sites = 5;            
        } else {
            return;
        }
        var current_site = Math.floor((start / 10) + 1);

        var message = "";
        var end;

        if(guilds[msg.guild.id].queue.length < (start + 10)) {
            end = guilds[msg.guild.id].queue.length;
        } else {
            end = start + 10;
        }

        for (var i = start; i < end; i++) {
            var temp = (i === 0 ? "\n**" + texts.queue_current + "**\n" : "") + (i === 1 ? "\n**" + texts.queue_upnext + "**\n" : "") + "▫️ **" + (i + 1) + ":** " + guilds[msg.guild.id].queue[i].info.title + "\n";
            
            if ((message + temp).length <= 2000 - 3) {
                message += temp;
            } else {
                msg.channel.send(message);
            }
        }

        var emb = new RichEmbed();
        
        emb.setDescription(message);
        emb.setColor(msg.channel.guild.me.displayColor);
        emb.setTitle(texts.queue_title);
        emb.setFooter(len + " Songs | " + current_site + "/" + sites, Client.user.avatarURL);
        msg.channel.send('', emb);;
    }
}