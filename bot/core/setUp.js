const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

exports.run = async (Client, token) => {
    Client.log.info("[Setup] NPM Version - " + process.version);

    if(token == config.TOKEN) {
        const player = await Client.playermanager.join({
            guild: "403882830225997825",
            channel: "404312098970140672",
            host: "127.0.0.1"
        });
    }

    Client.log.info("[Setup] Successfully connected to Groovys official server");
    Client.log.info("[Setup] Successfully changed status to online");
    Client.log.info(`[Setup] The bot has started, with ${Client.users.size} users, in ${Client.channels.size} channels of ${Client.guilds.size} guilds.`);
    
    Client.user.setPresence({ game: { name: "" }, status: "online" });
}