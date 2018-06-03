var manager;

exports.msgUser = function(id,msg){
	var rand = Math.floor(Math.random()*manager.totalShards);
	manager.broadcastEval(`
		if(this.shard.id==${rand}){
			this.fetchUser('${id}')
			.then(user => {
				if(user!=undefined)
					user.send(\`${msg}\`)
					.catch(err => console.error(err));
			}).catch(err => console.error(err));
		}
	`);
}

exports.setManager = function(new_manager){
	manager = new_manager;
}