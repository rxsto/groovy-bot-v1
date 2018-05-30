const Client = process.Client;

const guild = Client.guilds.get("403882830225997825");
if(!guild) return;

const channel = Client.channels.get("411177077014790147");

Client.log.info("[Modules] Daily-Stats was loaded!");

setTimeout( () => {

    Client.sharder.fetchClientValues('guilds.size').then(results => {
        console.log(results);
        console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
    }).catch(console.error);

}, 60000);

setInterval( () => {
    sendStats(Client.users.size, Client.guilds.size);
}, 86400000);

function sendStats(members, servers) {
    setTimeout( () => {
        var dif_servers = Client.guilds.size - servers;
        var dif_members = Client.users.size - members;
    
        Client.functions.createEmbed(channel, `:part_alternation_mark: Today Groovy was invited to **${dif_servers}** servers with **${dif_members}** new members!\nSummarizing Groovy is now represented in ${Client.guilds.size} guilds with ${Client.users.size} members!`, "Daily statistics");
    }, 86399000);
}