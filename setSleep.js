const sleepStatus = new Map();
const override = new Map();

module.exports = {
  	getSleepStatus(serverId) {
    	return sleepStatus.get(serverId) || false;
  	},
  	setSleepStatus(serverId, status) {
    	sleepStatus.set(serverId, status);
  	},
  	getOverride(serverId) {
	    return override.get(serverId) || false;
  	},
  	setOverride(serverId, value) {
    	override.set(serverId, value);
  	}
};