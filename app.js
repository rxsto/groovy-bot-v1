process.setMaxListeners(100);
global.Promise = require("bluebird");
global.cluster = require("cluster");
if(cluster.isMaster) require("./master");
else require("./worker");