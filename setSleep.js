let isAsleep = false;
let override = false;

module.exports = {
	get isAsleep() {
		return isAsleep;
	},
	setAsleep(value) {
		isAsleep = value;
	},
	get override() {
		return override;                        },
	setOverride(value) {
		override = value;
	}
};
