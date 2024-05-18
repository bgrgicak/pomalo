import { newId } from '@/data/pouchdb';
import type Notice from '@/types/notice';
import { defineStore } from 'pinia';
import { type Ref, computed, ref, watch } from 'vue';
import { useActivityStore } from './activities';
import { NoticeType } from '@/types/notice';
import type Activity from '../types/activity';
import {
	getLocalDate,
	getUtcTimestamp,
	includesDate,
	minuteInMilliseconds,
} from '../helper/date';
import { add, addHours, formatDistance } from 'date-fns';
import { calculateAlarmDate } from '../data/activities';
import { updateEventFieldInActivity } from '../data/events';
import type { ActivityEvent } from '../types/activity';
import { useLayoutStore } from './layout';
import { useSettingsStore } from './settings';

interface NoticeState {
	notices: Notice[];
}

export const useNoticeStore = defineStore('notices', () => {
	const state: Ref<NoticeState> = ref({
		notices: [],
	});

	const activityStore = useActivityStore();
	const layoutStore = useLayoutStore();
	const settingsStore = useSettingsStore();

	const maybeAddNativeNotice = (notice: Notice) => {
		if (!('Notification' in window)) {
			return;
		}

		if (Notification.permission === 'granted') {
			// Move to web workers to make it persistent https://developer.chrome.com/blog/notification-requireInteraction/
			const notification = new Notification(notice.title, {
				requireInteraction: true,
			});
			notification.onclick = () => {
				if (notice.onClick) {
					notice.onClick(notice);
				}
			};
		}
	};

	const maybeAddNotice = (activity: Activity) => {
		if (!activity.alarms || activity.alarms.length === 0) {
			return;
		}
		const now = getLocalDate();
		const futureEvents = activity.events.filter(
			(event) => event.start >= now
		);
		if (futureEvents.length === 0) {
			return;
		}
		const nextEvent = futureEvents.reduce((a, b) =>
			a.start < b.start ? a : b
		);
		const eventAlarms = activity.alarms.map((alarm) =>
			calculateAlarmDate(alarm, nextEvent.start)
		);
		const nextAlarm = eventAlarms.reduce((a, b) => (a < b ? a : b));
		if (nextAlarm > now) {
			return;
		}
		if (
			nextEvent.alarmDismissed &&
			includesDate(nextAlarm, nextEvent.alarmDismissed)
		) {
			return;
		}

		if (
			notices.value.some(
				(notice) =>
					notice?.options.eventId === nextEvent.id &&
					notice?.options.alarm === nextAlarm
			)
		) {
			return;
		}

		const dismissNotice = async (notice: Notice) => {
			if (
				!notice.options.activityId ||
				!notice.options.eventId ||
				!notice.options.alarm ||
				!notice._id
			) {
				return;
			}
			const activity = await activityStore.get(notice.options.activityId);
			if (!activity || !activity.events) {
				return;
			}
			const event = activity.events.find(
				(event: ActivityEvent) => event.id === notice.options.eventId
			);
			if (!event) {
				return;
			}

			const dismissedAlarms = nextEvent.alarmDismissed || [];
			dismissedAlarms.push(notice.options.alarm);

			activityStore
				.update(
					updateEventFieldInActivity(
						activity,
						event,
						'alarmDismissed',
						dismissedAlarms
					)
				)
				.then(() => {
					removeNotice(notice._id!);
				});
		};

		const startsIn = formatDistance(nextEvent.start, now);

		const newNotice = {
			title: `${activity.title} starts in ${startsIn}`,
			type: NoticeType.Info,
			onDismiss: dismissNotice,
			onClick: async (notice: Notice) => {
				if (
					!notice.options.activityId ||
					!notice.options.eventId ||
					!notice._id
				) {
					return;
				}
				layoutStore.showRightSidebar(
					notice.options.activityId,
					notice.options.eventId
				);

				dismissNotice(notice);
			},
			options: {
				activityId: activity._id,
				eventId: nextEvent.id,
				alarm: nextAlarm,
			},
		};
		addNotice(newNotice);
		maybeAddNativeNotice(newNotice);
	};

	watch(
		() => activityStore.list,
		() => {
			activityStore.list.forEach((activity) => {
				maybeAddNotice(activity);
			});
		}
	);

	const checkPermissions = (force: boolean = false) => {
		if (!('Notification' in window)) {
			return;
		}

		if (Notification.permission === 'granted') {
			return;
		}

		if (!force && settingsStore.get('nativeNoticesEnabled') === false) {
			return;
		}

		addNotice({
			title: 'Would you like to enable notifications?',
			type: NoticeType.Warning,
			onDismiss: (notice) => {
				removeNotice(notice._id!);
			},
			onClick: () => {
				if (Notification.permission !== 'denied') {
					Notification.requestPermission().then((permission) => {
						if (permission === 'denied') {
							settingsStore.update('nativeNoticesEnabled', false);
							settingsStore.save();
						}
					});
				}
			},
		});
	};

	const load = () => {
		const now = getLocalDate();
		return activityStore
			.find({
				selector: {
					eventFirstStart: {
						$lte: getUtcTimestamp(addHours(now, 12)),
					},
					eventLastEnd: {
						$gte: getUtcTimestamp(now),
					},
					timerRunning: {
						$eq: false,
					},
					alarms: {
						$ne: [],
					},
				},
			})
			.then((activities) => {
				if (!activities) {
					return;
				}
				activities.forEach((activity: Activity) => {
					maybeAddNotice(activity);
				});
			});
	};
	load();
	setInterval(load, minuteInMilliseconds * 30);

	const notices = computed(() => state.value.notices);

	const addNotice = (notice: Notice) => {
		if (!notice._id) {
			notice._id = newId();
		}
		state.value.notices.push(notice);
	};
	const getNotice = (noticeId: string) => {
		return state.value.notices.find((notice) => notice._id === noticeId);
	};
	const removeNotice = (noticeId: string) => {
		const notice = getNotice(noticeId);
		if (!notice) {
			return;
		}
		state.value.notices = state.value.notices.filter(
			(notice) => notice._id !== noticeId
		);
	};

	return {
		notices,
		addNotice,
		removeNotice,
		checkPermissions,
	};
});
