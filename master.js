const botHandler = require("./worker_handling/bot");
const superagent = require("superagent");
const fs = require("fs");

var shardAmount = null;

function handleWorker(worker) {
	if(worker.type === "bot") botHandler(worker);
}

Object.defineProperty(cluster, "onlineWorkers", {
	get: () => Object.keys(cluster.workers)
		.map(id => cluster.workers[id])
		.filter(work => work.isConnected())
});

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

async function init() {
	console.log("Groovy");
	
	const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization", config.TOKEN);

	process.totalShards = totalShards;
	shardAmount = totalShards;

	let shardsPerWorker;

	const coreCount = require("os").cpus().length;
	if(coreCount >= totalShards) shardsPerWorker = 1;
	else shardsPerWorker = Math.ceil(totalShards / coreCount);

	const workerCount = Math.ceil(totalShards / shardsPerWorker);
	for(let i = 0; i < workerCount; i++) {
		let shardStart = i * shardsPerWorker, shardEnd = ((i + 1) * shardsPerWorker) - 1;
		if(shardEnd > totalShards - 1) shardEnd = totalShards - 1;
		let shardRange = shardStart === shardEnd ? `shard ${shardStart}` : `shards ${shardStart}-${shardEnd}`;

		const worker = cluster.fork();
		Object.assign(worker, { type: "bot", shardStart, shardEnd, shardRange, totalShards });
		handleWorker(worker);
	}
}

init();