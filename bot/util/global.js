var manager;

exports.msgUser = function(id,msg){
	var x = Math.floor(Math.random() * manager.totalShards);
	manager.broadcastEval(`
		if(this.shard.id==${x}){
			this.fetchUser('${id}').then(user => {
				if(user != undefined) user.send(\`${msg}\`).catch(err => console.error(err));
			}).catch(err => console.error(err));
		}
	`);
}

exports.setManager = function(new_manager){
	manager = new_manager;
}