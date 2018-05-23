const fs = require("fs");
const DBL = require("dblapi.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

const dbl = new DBL(config.LIST_ORG);

module.exports.run = (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    switch(args.length) {
        case 0:
        Embed.createEmbed(msg.channel, texts.vote_text1 + guild.prefix + texts.vote_text2, texts.vote_title);
        break;

        case 1:
        if(args[0] == "check") {
            if(!Client.voted[msg.author.id]) {
                Client.voted[msg.author.id] = {
                    premium: false,
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
                        if(Client.voted[msg.author.id].premium == true) return Embed.createEmbed(msg.channel, texts.vote_already, texts.error_title);
                        if(Client.voted[msg.author.id].voted == true) return Embed.createEmbed(msg.channel, texts.vote_wait, texts.error_title);
                        Client.voted[msg.author.id].premium = true;
                        Embed.createEmbed(msg.channel, texts.vote_success_text, texts.vote_success_title);
                        Client.voted[msg.author.id].voted = true;
                        setTimeout( () => {
                            Client.voted[msg.author.id].premium = false;
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