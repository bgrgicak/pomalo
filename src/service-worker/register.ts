
import { registerSW } from 'virtual:pwa-register';
import { debug, error as errorLog } from '@/helper/logs';
import { getCalendarUrls, getLastCalendarSync, syncIntervalMilliseconds, updateLastCalendarSync } from './ical-sync';
import { useActivityStore } from '@/stores/activities';
import { minuteInMilliseconds } from '@/helper/date';
import type Activity from '@/types/activity';

const syncCalendar = (worker: Worker) => {
	getCalendarUrls().forEach(async (calendarUrl) => {
		worker.postMessage(
			JSON.stringify({
				calendarUrl,
				lastCalendarSync: getLastCalendarSync(calendarUrl)
			})
		);
		updateLastCalendarSync(calendarUrl);
	});
};

export const updateSW = registerSW({
	immediate: true,
	onRegisteredSW (swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
		if (!registration?.active) {
			return;
		}
		if (window.Worker) {
			const worker = new Worker(swScriptUrl, { type: 'module' });

			setInterval(
				() => syncCalendar(worker),
				syncIntervalMilliseconds()
			);
			setTimeout(
				() => syncCalendar(worker),
				minuteInMilliseconds
			);

			worker.onmessage = (event: MessageEvent) => {
				debug('SW message', event.data);
				const activityStore  = useActivityStore();
				if (event.data.type === 'calendar-sync') {
					activityStore.addOrUpdate(event.data.activity);
				} else if (event.data.type === 'calendar-sync-all-ids') {
					const { eventIds, calendarUrl } = event.data;
					activityStore.find(
						{
							selector: {
								_id: {
									$nin: eventIds
								},
								parent: {
									$eq: calendarUrl
								}
							}
						}
					).then((activities: Activity[] | void) => {
						if (!activities) {
							return;
						}
						activities.forEach((activity: Activity) => {
							activityStore.remove(activity._id);
						});
					});
				}
			};
		}
	},
	onRegisterError (error: Error) {
		errorLog('SW registration error: ', error);
	}
});
