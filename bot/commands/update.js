const main = require("../main.js");

exports.run = (Client, guilds, Embed, msg, args) => {
    if(msg.author.id != "254892085000405004") return;

    g = Client.guilds.array();

    g.forEach(guild => {
        c = guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber()).first();
        try {
            Embed.createEmbed(c, texts.update_text, texts.update_title);            
        } catch (error) {
            console.log(error);
        }
    });
}