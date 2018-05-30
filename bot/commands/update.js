const fs = require("fs");
const snekfetch = require("snekfetch");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

module.exports.run = async (Client, msg, args) => {

    if(msg.author.id != "254892085000405004") return;

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    console.log("rework this shit");

    /*var players = Client.playermanager.array();

    var channels = [];

    await players.forEach(async player => {
        channels.push(Client.guilds.get(player.id).me.voiceChannel);
        await player.volume(0);
        setTimeout(async () => {
            await Client.playermanager.leave(player.id);

            await channels.forEach(async channel => {
                if(!channel || channel == null) return;
                channel.join().then(async c => {
                    const broadcast = Client.createVoiceBroadcast();
                    broadcast.playFile("./home/bot/Groovy/bot/audio/update.mp3"); // /home/bot/Groovy/bot/audio/update.mp3 (LINUX) - D:/Archiv/Discord/Groovy/Groovy/bot/audio/update.mp3 (WIN)
                    for (const connection of Client.voiceConnections.values()) {
                        connection.playBroadcast(broadcast);
                    }
                    await broadcast.on("end", async end => {
                        await channels.forEach(async channel => {
                            await channel.leave();
                        });
                    });
                });
            });
        }, 2000);
    });*/

    // save queue + proccess foreach player
    // save loop, loopqueue, shuffle, pause etc

    // add init with join etc
}