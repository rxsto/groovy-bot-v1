module.exports = async (Client, id) => {
    const guild = Client.guilds.get("403882830225997825");
    if(!guild) return;

    const channel = guild.channels.get(id);

    Client.log.info("[Modules] Daily-Stats was loaded!");

    var servers;
    var members;
    var commands;

    setTimeout(async () => {
        await getStats(Client);
        startModule(Client);
    }, 60000);

    function startModule(Client) {
        sendStats(members, servers, commands);
        setInterval(async () => {
            await getStats(Client);
            sendStats(members, servers, commands);
        }, 86400000);
    }

    function sendStats(members_old, servers_old, commands_old) {
        setTimeout(async () => {
            await getStats(Client);
            var dif_servers = servers - servers_old;
            var dif_members = members - members_old;
            var dif_commands = commands - commands_old;
        
            Client.functions.createEmbed(channel, `:part_alternation_mark: Today Groovy was invited to **${dif_servers}** servers with **${dif_members}** new members! Also today **${dif_commands}** commands were executed!\nSummarizing Groovy is now represented in ${Client.guilds.size} guilds with ${Client.users.size} members!`, "Daily statistics");
        }, 86399000);
    }

    async function getStats(Client) {
        await Client.shard.fetchClientValues('guilds.size').then(results => {
            servers = results.reduce((prev, val) => prev + val, 0);
        }).catch(console.error);
    
        await Client.shard.fetchClientValues('users.size').then(results => {
            members = results.reduce((prev, val) => prev + val, 0);
        }).catch(console.error);
    
        await Client.shard.fetchClientValues('executed').then(results => {
            commands = results.reduce((prev, val) => prev + val, 0);
        }).catch(console.error);
    }
}