const createManager = require("../audio/playerManager.js");

exports.run = async (Client) => {
    const player = await Client.playermanager.join({
        guild: "403882830225997825",
        channel: "404312098970140672",
        host: "127.0.0.1"
    });

    Client.log.info("[Setup] Successfully connected to Groovys official server");
    
    Client.user.setStatus('online');

    Client.log.info("[Setup] Successfully changed status to online");

    Client.log.info(`[Setup] The bot has started, with ${Client.users.size} users, in ${Client.channels.size} channels of ${Client.guilds.size} guilds.`);
}