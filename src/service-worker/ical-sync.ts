import { getUtcTimestamp, isValidDate } from '@/helper/date';
import { settings } from '@/helper/settings';
import { useSettingsStore } from '@/stores/settings';

export const syncIntervalMilliseconds = () => {
	const syncIntervalMinutes = useSettingsStore().get('calendarSyncInterval');
	return (
		syncIntervalMinutes ?? settings.calendar.syncIntervalMinutes
	) * 60 * 1000;
};

export const getCalendarUrls = (): string[] => {
	const calendars = useSettingsStore().get('calendarIcalUrls');
	if (!calendars) {
		return [];
	}
	return calendars.split('\n');
};


export const lastCalendarSyncSettingsKey = (calendarUrl: string) => {
	return 'lastCalendarSync' + btoa(calendarUrl);
};

export const getLastCalendarSync = (calendarUrl: string): Date | undefined => {
	let lastCalendarSync: Date | undefined = new Date(
		useSettingsStore().get(
			lastCalendarSyncSettingsKey(calendarUrl)
		)
	);
	if (!isValidDate(lastCalendarSync)) {
		lastCalendarSync = undefined;
	}
	return lastCalendarSync;
};

export const updateLastCalendarSync = (calendarUrl: string) => {
	const settingsStore = useSettingsStore();
	settingsStore.update(
		lastCalendarSyncSettingsKey(calendarUrl),
		getUtcTimestamp()
	);
	settingsStore.save();
};