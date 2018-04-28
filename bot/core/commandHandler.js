const fs = require("fs");

const checkGuild = require("../util/checkGuild.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

const commands = {
    help: "help",
    info: "info",
    invite: "invite",
    support: "support",
    donate: "donate",
    stats: "stats",
    ping: "ping",

    play: "play", p: "play", add: "play",
    join: "join",
    pause: "pause",
    resume: "resume", r: "resume",
    loop: "loop",
    loopqueue: "loopqueue", loopq: "loopqueue", lq: "loopqueue",
    np: "np", nowplaying: "np", player: "np", control: "np", cp: "np",
    seek: "seek",
    shuffle: "shuffle", sh: "shuffle",
    skip: "skip", s: "skip",
    remove: "remove", rm: "remove",
    move: "move", mv: "move",
    reset: "reset",
    stop: "stop", st: "stop",
    leave: "leave", l: "leave",
    clear: "clear", cl: "clear",
    volume: "volume", vol: "volume",
    queue: "queue", q: "queue",
    settings: "settings", set: "settings",

    setpresence: "setpresence", setp: "setpresence",
    broadcast: "broadcast", bc: "broadcast",
    update: "update", up: "update",
}

module.exports.run = async (Client, guilds, Embed, msg) => {

    if(!msg.channel.type == "text") return;
    if(!msg.guild) return;

    if(!guilds[msg.guild.id]) {
        await checkGuild.run(Client, guilds, msg.guild, config.PREFIX, msg.guild.me.displayColor);
    }

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(msg.isMentioned(Client.user)) {
        Embed.createEmbed(msg.channel, texts.mentioned1 + guilds[msg.guild.id].prefix + texts.mentioned2 + guilds[msg.guild.id].prefix + texts.mentioned3, texts.mentioned_title);
        return;
    }

    if(msg.channel.type == "text" && msg.content.startsWith(guilds[msg.guild.id].prefix)) {

        var invoke = msg.content.split(' ')[0].substr(guilds[msg.guild.id].prefix.length);
        var args   = msg.content.split(' ').slice(1);
        
        if(invoke in commands) {
            let commandFile = require(`../commands/${commands[invoke]}.js`);
            try {
                commandFile.run(Client, guilds, Embed, msg, args);
            } catch (error) {
                console.log(error);
                Embed.createEmbed(msg.channel, error.message, texts.error_title);
            }
        }
    }    
}