const sleepStatus = new Map();
const manualMode = new Map();

module.exports = {
    getSleepStatus(serverId) {
        return sleepStatus.get(serverId) || false;
    },
    setSleepStatus(serverId, status) {
        sleepStatus.set(serverId, status);
    },
    getManualMode(serverId) {
        return manualMode.get(serverId) || null;
    },
    setManualMode(serverId, mode) {
        // mode: null | 'sleep' | 'wake'
        manualMode.set(serverId, mode);
    },
    clearManualMode(serverId) {
        manualMode.delete(serverId);
    },
};