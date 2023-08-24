
import { registerSW } from 'virtual:pwa-register';
import { error as errorLog } from '@/helper/logs';
import { getCalendarUrls, getLastCalendarSync, syncIntervalMilliseconds } from './ical-sync';
import { useActivityStore } from '@/stores/activities';
import { minuteInMilliseconds } from '@/helper/date';

const syncCalendar = (worker: Worker) => {
	getCalendarUrls().forEach(async (calendarUrl) => {
		worker.postMessage(
			JSON.stringify({
				calendarUrl,
				lastCalendarSync: getLastCalendarSync(calendarUrl)
			})
		);
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
			  if (event.data.type === 'calendar-sync') {
					useActivityStore().addOrUpdate(event.data.activity);
			  }
			};
		}
	},
	onRegisterError (error: Error) {
		errorLog('SW registration error: ', error);
	}
});
