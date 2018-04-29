const messageHandler = require("../worker_handling/messages.js");
const workerCrashes = {};

const log = require("../bot/util/logger.js");

module.exports = async worker => {
	worker.on("online", () => {
		log.info(`[ShardManager] Worker ${worker.id} started (hosting ${worker.shardRange})`);
		worker.send({
			type: "startup",
			shardRange: worker.shardRange,
			shardStart: worker.shardStart,
			shardEnd: worker.shardEnd,
			totalShards: worker.totalShards,
			processType: "bot"
		});

	});

	worker.on("exit", (code, signal) => {
		if(signal) {
			return;
		} else if(code === 0) {
			console.info(`Worker ${worker.id} killed successfully ` +
				`(hosted shards ${worker.shardStart}-${worker.shardEnd}).`);

		} else if(workerCrashes[worker.shardRange] >= 5) {
			console.error(`Worker ${worker.id} killed due to restart loop with ` +
					`exit code: ${code} (hosted ${worker.shardRange}).`);

		} else {
			console.warn(`Worker ${worker.id} died with exit code ${code} ` +
				`(hosted ${worker.shardRange}). Respawning new process...`);
			const newWorker = cluster.fork();
			Object.assign(newWorker, {
				type: "bot",
				shardStart: worker.shardStart,
				shardEnd: worker.shardEnd,
				shardRange: worker.shardRange,
				totalShards: worker.totalShards
			});
			module.exports(newWorker);


			if(!workerCrashes[worker.shardRange]) workerCrashes[worker.shardRange] = 1;
			else workerCrashes[worker.shardRange]++;
			setTimeout(() => {
				if(workerCrashes[worker.shardRange] === 1) delete workerCrashes[worker.shardRange];
				else workerCrashes[worker.shardRange]--;
			}, 120000);
		}
	});

	worker.on("message", msg => messageHandler(msg, worker));
};