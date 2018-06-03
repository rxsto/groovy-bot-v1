const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var emojis = {
        error: "<:error:449207829619015680>",
        check: "<:check:449207827026673677>",
    }

    var groovy = msg.guild.me;
    var check_perms = 0;

    var defaults = [];
    defaults.push(":grey_question: Send messages");
    defaults.push(":grey_question: Manage messages");
    defaults.push(":grey_question: Add reactions");
    defaults.push(":grey_question: Join voicechannels");
    defaults.push(":grey_question: Speak in voicechannels");

    var emb = new Discord.RichEmbed();
    emb.setTitle("Checking permissions...");
    emb.setDescription(":warning: Checking permissions... Please wait!");
    emb.setColor(msg.guild.me.displayColor);

    msg.channel.send(emb).then(async message => {
        setTimeout( () => {
            emb.setDescription(defaults);
            message.edit(emb);

            setTimeout( () => {
                defaults[0] = (groovy.hasPermission("SEND_MESSAGES") ? emojis.check : emojis.error) + " Send messages";
                if(groovy.hasPermission("SEND_MESSAGES")) check_perms++;

                emb.setDescription(defaults);
                message.edit(emb);

                setTimeout( () => {
                    defaults[1] = (groovy.hasPermission("MANAGE_MESSAGES") ? emojis.check : emojis.error) + " Manage messages";
                    if(groovy.hasPermission("MANAGE_MESSAGES")) check_perms++;
                    
                    emb.setDescription(defaults);
                    message.edit(emb);

                    setTimeout( () => {
                        defaults[2] = (groovy.hasPermission("ADD_REACTIONS") ? emojis.check : emojis.error) + " Add reactions";
                        if(groovy.hasPermission("ADD_REACTIONS")) check_perms++;
                        
                        emb.setDescription(defaults);
                        message.edit(emb);
                    }, randomTime());

                    setTimeout( () => {
                        defaults[3] = (groovy.hasPermission("CONNECT") ? emojis.check : emojis.error) + " Join voicechannels";
                        if(groovy.hasPermission("CONNECT")) check_perms++;
                        
                        emb.setDescription(defaults);
                        message.edit(emb);
                    }, randomTime());

                    setTimeout( () => {
                        defaults[4] = (groovy.hasPermission("SPEAK") ? emojis.check : emojis.error) + " Speak in voicechannels";
                        if(groovy.hasPermission("SPEAK")) check_perms++;
                        
                        emb.setDescription(defaults);
                        emb.setTitle("Finished!")
                        message.edit(emb);

                        if(check_perms < 5) {
                            fazit = emojis.error + " The bot is not able to work properly! Check his permissions!";
                            fazit_title = "Error!";
                        } else {
                            fazit = emojis.check + " The bot is fully functional and has access to all needed permissions!";
                            fazit_title = "Functional!";
                        }

                        setTimeout( () => {
                            Client.functions.createEmbed(msg.channel, fazit, fazit_title);
                        }, randomTime());
                    }, randomTime());
                }, randomTime());
            }, randomTime());
        }, randomTime());
    });

    function randomTime() {
        return Math.floor(Math.random() + 1) * 1000;
    }
}