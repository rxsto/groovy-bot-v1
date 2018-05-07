const fs = require("fs");
const DBL = require("dblapi.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

const dbl = new DBL(config.LIST_ORG);

module.exports.run = (Client, guilds, Embed, msg, args) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    switch(args.length) {
        case 0:
        Embed.createEmbed(msg.channel, texts.vote_text1 + guilds[msg.guild.id].prefix + texts.vote_text2, texts.vote_title);
        break;

        case 1:
        if(args[0] == "check") {
            if(!Client.voted[msg.author.id]) {
                Client.voted[msg.author.id] = {
                    voted: false
                }
            }
            dbl.hasVoted(msg.author.id).then(voted => {
                if(voted) {
                    var guild = Client.guilds.get("403882830225997825");
                    if(!guild.members.has(msg.author.id)) {
                        Embed.createEmbed(msg.channel, texts.vote_not_member, texts.error_title);
                    } else {
                        var member = guild.members.get(msg.author.id);
                        if(member.roles.has("437546966713630722")) return Embed.createEmbed(msg.channel, texts.vote_already, texts.error_title);
                        if(Client.voted[msg.author.id].voted == true) return Embed.createEmbed(msg.channel, texts.vote_wait, texts.error_title);
                        member.addRole("437546966713630722");
                        Embed.createEmbed(msg.channel, texts.vote_success_text, texts.vote_success_title);
                        Client.voted[msg.author.id].voted = true;
                        setTimeout( () => {
                            member.removeRole("437546966713630722");
                            member.user.send(texts.vote_end);
                            setTimeout( () => {
                                Client.voted[msg.author.id].voted = false;
                            }, 82800000);
                        }, 3600000);
                    }
                } else {
                    Embed.createEmbed(msg.channel, texts.vote_not, texts.error_title);
                }
            });
        }
        break;

        default:
        return;
    }
}