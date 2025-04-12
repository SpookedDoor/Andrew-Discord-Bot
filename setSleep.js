const sleepStatus = new Map();
const override = new Map();
const wakeOverride = new Map();

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
  	},
  	getWakeOverride(serverId) {
	    return wakeOverride.get(serverId) || false;
  	},
  	setWakeOverride(serverId, value) {
    	wakeOverride.set(serverId, value);
	},
};
