export const getSystemDateFormat = () => {
    let customDate = new Date(2222, 11, 18);
    let strDate = customDate.toLocaleDateString();
    let format = strDate
        .replace("12", "MM")
        .replace("18", "DD")
        .replace("2222", "yyyy");
    return format;
};

const prepareDate = (date?: Date | string | number) => {
    if (!date) {
        return new Date();
    }
    if (typeof date === 'string' || typeof date === 'number') {
        return new Date(date);
    }
    return date;
};

export const hourInMilliseconds = 1000 * 60 * 60;
export const dayInMilliseconds = hourInMilliseconds * 24;
export const weekInMilliseconds = dayInMilliseconds * 7;
export const yearInMilliseconds = dayInMilliseconds * 365;
export const daysInAYear = 365;

/**
 * Convert UTC date to local date string
 */
export const toLocaleDateString = (date?: Date | string | number) => {
    date = getLocalDate(prepareDate(date));
    return date.toLocaleDateString();
};

export const toInputDateString = (date?: Date | string | number) => {
    date = prepareDate(date);
    const padTo2Digits = (num: any) => {
        return num.toString().padStart(2, '0');
    };
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
    ].join('-');
};

export const getUtcTimestamp = (date?: Date | string | number) => {
    date = prepareDate(date);
    return Math.floor(new Date(date.toUTCString()).getTime());
};

export const getLocalDate = (date?: Date | string | number) => {
    date = prepareDate(date);
    return new Date(date.getTime() - date.getTimezoneOffset());
};

export const getTimePassed = (start: Date | string | number, end?: Date | string | number) => {
    start = prepareDate(start);
    end = end ? prepareDate(end) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const getWeekStartAndEnd = (date?: Date | string | number) => {
    var d = getLocalDate(prepareDate(date));
    var to = d.setTime(d.getTime() - (d.getDay() ? d.getDay() : 7) * dayInMilliseconds);
    var from = d.setTime(d.getTime() - 6 * dayInMilliseconds);
    return {
        start: new Date(from),
        end: new Date(to),
    };
};

export const maxDate = () => {
    return new Date(8640000000000000);
};

export const minutesBetweenDates = (start: Date, end: Date) => {
    return Math.round((start.getTime() - end.getTime()) / 60000);
};

export const daysBetweenDates = (start: Date, end: Date) => {
    return Math.round((start.getTime() - end.getTime()) / dayInMilliseconds);
};

export const weeksBetweenDates = (start: Date, end: Date) => {
    return Math.round((start.getTime() - end.getTime()) / (dayInMilliseconds * 7));
};

export const isValidDate = (date: any) => {
    return date instanceof Date && !isNaN(date as any);
};

export const addMilliseconds = (date: Date, milliseconds: number) => {
    return new Date(getUtcTimestamp(date) + milliseconds);
};