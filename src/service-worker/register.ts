
import { registerSW } from 'virtual:pwa-register';
import { debug, error as errorLog } from '@/helper/logs';
import { getCalendarUrls, getLastCalendarSync, syncIntervalMilliseconds, updateLastCalendarSync } from './ical-sync';
import { useActivityStore } from '@/stores/activities';
import { minuteInMilliseconds } from '@/helper/date';
import type Activity from '@/types/activity';
import constants from '../helper/constants';

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
				constants.environment.development ? 1 : minuteInMilliseconds
			);

			worker.onmessage = (event: MessageEvent) => {
				debug('SW message', event.data);
				const activityStore  = useActivityStore();
				if (event.data.type === 'calendar-sync') {
					if (!event.data.activities) {
						return;
					}
					(Object.values(event.data.activities) as Activity[]).forEach( ( activity: Activity ) => {
						activityStore.addOrUpdate(activity);
					} );
				} else if (event.data.type === 'calendar-sync-all-ids') {
					// Remove all calendar events that are not in the calendar anymore
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
