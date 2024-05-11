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
	minuteInMilliseconds,
} from '../helper/date';
import { add, addHours, addWeeks, formatDistance, set } from 'date-fns';
import { calculateAlarmDate } from '../data/activities';
import { updateEventFieldInActivity } from '../data/events';
import type { ActivityEvent } from '../types/activity';

interface NoticeState {
	notices: Notice[];
}

export const useNoticeStore = defineStore('notices', () => {
	const state: Ref<NoticeState> = ref({
		notices: [],
	});

	const activityStore = useActivityStore();
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
			nextEvent.alarmDismissed.includes(nextAlarm)
		) {
			return;
		}

		const startsIn = formatDistance(nextEvent.start, now);
		addNotice({
			title: `${activity.title} starts in ${startsIn}`,
			type: NoticeType.Info,
			dismissCallback: async (notice) => {
				if (!notice.options.activityId || !notice.options.eventId) {
					return;
				}
				const activity = await activityStore.get(
					notice.options.activityId
				);
				if (!activity || !activity.events) {
					return;
				}
				const event = activity.events.find(
					(event: ActivityEvent) =>
						event.id === notice.options.eventId
				);
				if (!event) {
					return;
				}

				const dismissedAlarms = nextEvent.alarmDismissed || [];
				dismissedAlarms.push(nextAlarm);

				updateEventFieldInActivity(
					activity,
					event,
					'alarmDismissed',
					dismissedAlarms
				);
			},
			options: {
				activityId: activity._id,
				eventId: nextEvent.id,
			},
		});
	};

	watch(
		() => activityStore.list,
		() => {
			activityStore.list.forEach((activity) => {
				maybeAddNotice(activity);
			});
		}
	);

	const load = () => {
		const now = getLocalDate();
		return activityStore
			.find({
				selector: {
					eventFirstStart: {
						$lte: getUtcTimestamp(now),
					},
					eventLastEnd: {
						$gte: getUtcTimestamp(addWeeks(now, 3)),
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
		if (notice.dismissCallback) {
			notice.dismissCallback(notice);
		}
		state.value.notices = state.value.notices.filter(
			(notice) => notice._id !== noticeId
		);
	};

	return {
		notices,
		addNotice,
		removeNotice,
	};
});
