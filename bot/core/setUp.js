const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

exports.run = async (Client, token) => {
    const guild = Client.guilds.get("403882830225997825");
    if(!guild) return;

    process.setMaxListeners(0);
    require('events').EventEmitter.prototype._maxListeners = 0;

    if(token == config.Groovy.TOKEN) {
        const player = await Client.playermanager.join({
            guild: guild.id,
            channel: "404312098970140672",
            host: "127.0.0.1"
        });
    }

    Client.appInfo = await Client.fetchApplication();
    setInterval( async () => {
        Client.appInfo = await Client.fetchApplication();
    }, 60000);

    Client.log.info("[Shard " + (Client.shard.id + 1) + "] [Setup] Successfully connected to Groovys official server");
    Client.user.setPresence({ game: { name: "" }, status: "online" });
}