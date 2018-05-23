const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

exports.run = async (Client, token) => {
    process.setMaxListeners(0);
    require('events').EventEmitter.prototype._maxListeners = 0;

    if(token == config.TOKEN) {
        const player = await Client.playermanager.join({
            guild: "403882830225997825",
            channel: "404312098970140672",
            host: "127.0.0.1"
        });
    }

    Client.appInfo = await Client.fetchApplication();
    setInterval( async () => {
        Client.appInfo = await Client.fetchApplication();
    }, 60000);

    Client.log.info("[Setup] Successfully connected to Groovys official server");
    Client.user.setPresence({ game: { name: "" }, status: "online" });

    if(Client.token === config.TOKEN) {
        var channel = Client.channels.get("411177077014790147");
        Client.embed.createEmbed(channel, ":white_check_mark: Groovy started!", "Started");
    }
}