import { fromZonedTime } from 'date-fns-tz';

export const secondInMilliseconds = 1000;
export const minuteInMilliseconds = secondInMilliseconds * 60;
export const hourInMilliseconds = minuteInMilliseconds * 60;
export const dayInMilliseconds = hourInMilliseconds * 24;
export const weekInMilliseconds = dayInMilliseconds * 7;
export const yearInMilliseconds = dayInMilliseconds * 365;
export const daysInAYear = 365;

export const maxDate = () => new Date(8640000000000000);

export const getSystemDateFormat = () => {
	let customDate = new Date(2222, 11, 18);
	let strDate = customDate.toLocaleDateString();
	let format = strDate
		.replace('12', 'MM')
		.replace('18', 'DD')
		.replace('2222', 'yyyy');
	return format;
};

const prepareDate = (date?: Date | string | number | boolean) => {
	// date === true is used for legacy reasons
	if (!date || date === true) {
		return new Date();
	}
	if (typeof date === 'string' || typeof date === 'number') {
		return new Date(date);
	}
	return date;
};

/**
 * Convert UTC date to local date string
 */
export const toLocaleDateString = (date?: Date | string | number) => {
	date = getLocalDate(prepareDate(date));
	return date.toLocaleDateString();
};

export const toTimeString = (date?: Date | string | number) => {
	date = prepareDate(date);
	return new Date(date).toISOString().slice(11, 19);
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

/**
 * Get the difference between two dates in milliseconds
 * @param start Date
 * @param end Date
 * @returns number of milliseconds between start and end
 */
export const getTimeDifference = (start: Date, end: Date) => {
	return end.getTime() - start.getTime();
};

export const getTimePassed = (
	start: Date | string | number,
	end?: Date | string | number
) => {
	start = prepareDate(start);
	end = end ? prepareDate(end) : new Date();
	const diff = getTimeDifference(start, end);
	const hours = Math.floor(diff / 1000 / 60 / 60);
	const minutes = Math.floor((diff / 1000 / 60) % 60);
	const seconds = Math.floor((diff / 1000) % 60);
	return `${hours.toString().padStart(2, '0')}:${minutes
		.toString()
		.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Returns the first and last day of the week
 * @param date
 * @returns object with start and end date
 */
export const getWeekStartAndEnd = (date?: Date | string | number) => {
	const currentDate = getLocalDate(date);
	const day = currentDate.getDay();
	const start = setTime(currentDate);
	start.setDate(currentDate.getDate() - day + (day === 0 ? -6 : 1));

	const end = setTime(structuredClone(start));
	end.setDate(start.getDate() + 6);
	return {
		start,
		end,
	};
};

export const minutesBetweenDates = (start: Date, end: Date) => {
	return Math.round((start.getTime() - end.getTime()) / 60000);
};

export const daysBetweenDates = (start: Date, end: Date) => {
	return Math.round((start.getTime() - end.getTime()) / dayInMilliseconds);
};

export const weeksBetweenDates = (start: Date, end: Date) => {
	return Math.round(
		(start.getTime() - end.getTime()) / (dayInMilliseconds * 7)
	);
};

export const isValidDate = (date: any) => {
	return date instanceof Date && !isNaN(date as any);
};

export const addMilliseconds = (date: Date, milliseconds: number) => {
	return new Date(getUtcTimestamp(date) + milliseconds);
};

export const addDays = (date: Date, days: number) => {
	return addMilliseconds(date, days * dayInMilliseconds);
};

export const setTime = (
	date: Date,
	hours: number = 0,
	minutes: number = 0,
	seconds: number = 0,
	milliseconds: number = 0
) => {
	date.setHours(hours);
	date.setMinutes(minutes);
	date.setSeconds(seconds);
	date.setMilliseconds(milliseconds);
	return date;
};

/**
 * Combine a date and a time to a new date
 * This keeps the timezone from dateWithNewTime
 * @param newDate Date to use
 * @param dateWithNewTime Time and Timezone to use
 * @returns
 */
export const copyTimeFromDate = (newDate: Date, dateWithNewTime: Date) => {
	const charactersInDate = 15;
	return new Date(
		newDate.toString().substring(0, charactersInDate) +
			dateWithNewTime.toString().substring(charactersInDate)
	);
};

export const copyTimezoneDate = (newDate: Date, dateWithNewTimezone: Date) => {
	const charactersInDate = 25;
	return new Date(
		newDate.toString().substring(0, charactersInDate) +
			dateWithNewTimezone.toString().substring(charactersInDate)
	);
};

export const setTimezone = (date: Date, timezone: string) => {
	return fromZonedTime(date, timezone);
};

export const setToEndOfHour = (date: Date) => {
	if (!date) {
		return date;
	}
	if (date.getMinutes() === 0) {
		date.setMinutes(59);
		date.setSeconds(59);
		if (date.getHours() === 0) {
			date.setHours(23);
			date.setDate(date.getDate() - 1);
		} else {
			date.setHours(date.getHours() - 1);
		}
	}
	return date;
};
