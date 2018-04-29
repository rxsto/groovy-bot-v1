const { RichEmbed } = require('discord.js');
const Long = require("long");

const main = require("../main.js");

exports.run = (Client, guilds, Embed, msg, args) => {    
    if(msg.author.id != "254892085000405004") return;

    g = Client.guilds.array();
    u = Client.users.array();

    var sendto = args[0];
    var text = args.slice();
    text.shift();

    var title = text[0];
    text.shift();
    var content = text.join(" ");

    switch (sendto) {
        case "guilds":

            g.forEach(guild => {
                c = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber()).first();
                try {
                    Embed.createEmbed(c, content, title);           
                } catch (error) {
                    console.log(error);
                }
            });

            wasSent("guilds");
            
        break;


        case "owners":

            g.forEach(guild => {
                try {
                    var emb = new RichEmbed();                    
                    emb.setDescription(content);
                    emb.setColor(guild.me.displayColor);
                    emb.setTitle(title);
                    guild.owner.user.send('', emb);
                } catch (error) {
                    console.log(error);
                }
            });

            wasSent("owners");

        break;


        case "members":

            u.forEach(user => {
                if(user.bot) return;
                try {
                    var emb = new RichEmbed();                    
                    emb.setDescription(content);
                    emb.setColor(msg.guild.me.displayColor);
                    emb.setTitle(title);
                    user.send('', emb);
                } catch (error) {
                    console.log(error);
                }
            });

            wasSent("members");

        break;
    
        default:
        return;
    }

    function wasSent(to) {
        Embed.createEmbed(msg.channel, "The broadcast \"" + content + "\" was sent to all " + to + "!");
    }
}