exports.run = (Client, guilds, Embed, msg, args) => {
    if(msg.author.id != "254892085000405004") return;

    Client.user.setPresence({ game: { name: args.join(" ") }, status: "online" });
}