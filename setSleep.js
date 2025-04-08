let isAsleep = false;

module.exports = {
	get isAsleep() {
		return isAsleep;
	},
	setAsleep(value) {
		isAsleep = value;
	}
};