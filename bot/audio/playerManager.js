const { PlayerManager } = require("discord.js-lavalink");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

exports.run = (Client) => {
}