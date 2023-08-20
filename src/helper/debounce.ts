export const debounce = (value: any, delay: number = 1000) => {
	let timeout: any;
	return new Promise((resolve) => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			resolve(value);
		}, delay);
	});
};