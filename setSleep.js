const sleepStatus = new Map();

module.exports = {
  	getSleepStatus(serverId) {
    	return sleepStatus.get(serverId) || false;
  	},
  	setSleepStatus(serverId, status) {
    	sleepStatus.set(serverId, status);
  	},
  	getOverride(serverId) {
	    return sleepStatus.get(serverId) && sleepStatus.get(serverId).override;
  	},
  	setOverride(serverId, value) {
    	if (sleepStatus.get(serverId)) {
      		sleepStatus.get(serverId).override = value;
    	}
  	}
};