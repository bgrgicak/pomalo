export const getSystemDateFormat = () => {
    let customDate = new Date(2222, 11, 18);
    let strDate = customDate.toLocaleDateString();
    let format = strDate
        .replace("12", "MM")
        .replace("18", "DD")
        .replace("2222", "yyyy");
    return format;
};

export const toLocaleDateString = (date: Date) => {
    const padTo2Digits = (num: any) => {
        return num.toString().padStart(2, '0');
    };
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
    ].join('-');
};