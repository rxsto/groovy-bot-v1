const createManager = require("../audio/playerManager.js");

exports.run = async (Client) => {
    const player = await Client.playermanager.join({
        guild: "403882830225997825",
        channel: "404312098970140672",
        host: "127.0.0.1"
    });
    
    Client.user.setStatus('online');
    
    console.log(`[>] Bot has started, with ${Client.users.size} users, in ${Client.channels.size} channels of ${Client.guilds.size} guilds.`);
}