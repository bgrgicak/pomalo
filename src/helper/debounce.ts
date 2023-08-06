export const debounce = (value: any) => {
    let timeout: any;
    return new Promise((resolve) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            resolve(value);
        }, 1000);
    });
};