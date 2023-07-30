export const debounce = (value) => {
    let timeout;
    return new Promise((resolve) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            resolve(value);
        }, 1000);
    });
};