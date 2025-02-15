import { debug } from '@/helper/logs';
import { settings } from '@/helper/settings';
import Router from '@/router/router';
import { useActivityStore } from '@/stores/activities';
import { useNoticeStore } from '@/stores/notices';
import type Activity from '@/types/activity';
import {
	ActivityType,
	type ActivityAlarm,
	type ActivityEvent,
} from '@/types/activity';
import type { ActivityDocument } from '@/types/activity-document';
import { NoticeType } from '@/types/notice';
import {
	addDays,
	addWeeks,
	getLocalDate,
	getUtcTimestamp,
	maxDate,
} from '../helper/date';
import { newId } from './pouchdb';
import { getEstimatedDays, getEstimatedHours, getWorkedTime } from './priority';

export const getActivityLink = (activity: Activity): string => {
	if (ActivityType.Event === activity.type && activity.events.length > 0) {
		const latestEvent = activity.events[activity.events.length - 1];
		const date = getUtcTimestamp(latestEvent.start);
		return `/calendar/?date=${date}`;
	}
	return `/${activity.type}/${activity._id}/`;
};

export const emptyActivity = (type: ActivityType): Activity => {
	return {
		_id: newId(type),
		title: '',
		description: '',
		type,
		created: getLocalDate(),
		members: [],
		events: [],
		alarms: [],
		calculatedEstimatedTime: 0,
		calculatedTimeSpent: 0,
		archived: undefined,
	};
};

export const addDefaultsToActivity = (activity: Activity): Activity => {
	return {
		...emptyActivity(activity.type),
		...activity,
	};
};

export const openActivityPage = async (activity: Activity) => {
	return Router.push(getActivityLink(activity));
};

export const calculateAlarmDate = (alarm: ActivityAlarm, date: Date): Date => {
	let newDate = new Date(date);
	const isNegative = alarm.isNegative ? -1 : 1;
	if (alarm.weeks) {
		newDate = addWeeks(newDate, isNegative * alarm.weeks);
	}
	if (alarm.days) {
		newDate = addDays(newDate, isNegative * alarm.days);
	}
	if (alarm.hours) {
		newDate.setHours(newDate.getHours() + isNegative * alarm.hours);
	}
	if (alarm.minutes) {
		newDate.setMinutes(newDate.getMinutes() + isNegative * alarm.minutes);
	}
	if (alarm.seconds) {
		newDate.setSeconds(newDate.getSeconds() + isNegative * alarm.seconds);
	}
	return newDate;
};

export const calculateActivityStartEndDate = (activity: Activity) => {
	let eventFirstStart: Date | undefined = activity.startDate;
	let eventLastEnd: Date | undefined = activity.dueDate;
	if (activity.events.length > 0) {
		activity.events.forEach((event) => {
			if (
				undefined === eventFirstStart ||
				event.start < eventFirstStart
			) {
				eventFirstStart = event.start;
			}
			if (event.repeat) {
				if (
					event.repeatEnd &&
					(undefined === eventLastEnd ||
						event.repeatEnd > eventLastEnd)
				) {
					eventLastEnd = event.repeatEnd;
				} else {
					eventLastEnd = maxDate();
				}
			} else if (
				event.end &&
				(undefined === eventLastEnd || event.end > eventLastEnd)
			) {
				eventLastEnd = event.end;
			}
		});
	}

	const defaultDuration = activity.estimatedHours
		? getEstimatedDays(activity)
		: settings.defaultActivityDurationInDays;
	if (undefined === eventFirstStart) {
		eventFirstStart = eventLastEnd
			? addDays(eventLastEnd, -1 * defaultDuration)
			: activity.created;
	}

	if (undefined === eventLastEnd) {
		eventLastEnd = addDays(eventFirstStart, defaultDuration);
	}

	// Handle old corrupted data, this should not happen anymore
	if (eventFirstStart > eventLastEnd) {
		debug('Corrupted data detected on activity ' + activity._id);
		eventFirstStart = addDays(eventLastEnd, -1 * defaultDuration);
	}

	// If timer is running, set last end to max date to ensure it is loaded in the calendar
	if (activity.timerRunning) {
		eventLastEnd = maxDate();
	}

	// Updater first start to include alarms
	if (activity.alarms.length > 0 && eventFirstStart) {
		const firstStartWithAlarm = activity.alarms
			.map((alarm) => {
				return calculateAlarmDate(alarm, eventFirstStart as Date);
			})
			.reduce((a, b) => {
				return a < b ? a : b;
			});
		if (firstStartWithAlarm < eventFirstStart) {
			eventFirstStart = firstStartWithAlarm;
		}
	}

	return {
		eventFirstStart,
		eventLastEnd,
	};
};

const isTimerRunning = (activity: Activity): boolean => {
	if (activity.events.length > 0) {
		return (
			-1 <
			activity.events.findIndex((event: ActivityEvent) => {
				return !event.end;
			})
		);
	}
	return false;
};

export const calculateActivity = (activity: Activity): Activity => {
	const computedActivity = { ...activity };

	const { eventFirstStart, eventLastEnd } =
		calculateActivityStartEndDate(activity);
	computedActivity.eventFirstStart = eventFirstStart;
	computedActivity.eventLastEnd = eventLastEnd;

	computedActivity.timerRunning = isTimerRunning(activity);
	computedActivity.calculatedEstimatedTime = getEstimatedHours(activity);
	computedActivity.calculatedTimeSpent = getWorkedTime(activity);
	return computedActivity;
};

export const parseDocumentToActivity = (doc: ActivityDocument): Activity => {
	return {
		...doc,
		created: getLocalDate(doc.created),
		updated: doc.updated ? getLocalDate(doc.updated) : undefined,
		completedDate: doc.completedDate
			? getLocalDate(doc.completedDate)
			: undefined,
		startDate: doc.startDate ? getLocalDate(doc.startDate) : undefined,
		dueDate: doc.dueDate ? getLocalDate(doc.dueDate) : undefined,
		eventFirstStart: doc.eventFirstStart
			? getLocalDate(doc.eventFirstStart)
			: undefined,
		eventLastEnd: doc.eventLastEnd
			? getLocalDate(doc.eventLastEnd)
			: undefined,
		archived: doc.archived ? getLocalDate(doc.archived) : undefined,
		events: doc.events
			? doc.events.map((event) => {
				return {
					...event,
					start: getLocalDate(event.start),
					end: event.end ? getLocalDate(event.end) : undefined,
					repeatEnd: event.repeatEnd
						? getLocalDate(event.repeatEnd)
						: undefined,
					recurrenceId: event.recurrenceId
						? getLocalDate(event.recurrenceId)
						: undefined,
					exceptionDates: event.exceptionDates
						? event.exceptionDates.map((date) => {
							return getLocalDate(date);
							  })
						: [],
					alarmDismissed: event.alarmDismissed
						? event.alarmDismissed.map((date) => {
							return getLocalDate(date);
							  })
						: [],
				};
			  })
			: [],
	};
};

export const parseActivityToDocument = (
	activity: Activity
): ActivityDocument => {
	return {
		...activity,
		created: getUtcTimestamp(activity.created),
		updated: activity.updated
			? getUtcTimestamp(activity.updated)
			: undefined,
		completedDate: activity.completedDate
			? getUtcTimestamp(activity.completedDate)
			: undefined,
		startDate: activity.startDate
			? getUtcTimestamp(activity.startDate)
			: undefined,
		dueDate: activity.dueDate
			? getUtcTimestamp(activity.dueDate)
			: undefined,
		eventFirstStart: activity.eventFirstStart
			? getUtcTimestamp(activity.eventFirstStart)
			: undefined,
		eventLastEnd: activity.eventLastEnd
			? getUtcTimestamp(activity.eventLastEnd)
			: undefined,
		archived: activity.archived
			? getUtcTimestamp(activity.archived)
			: undefined,
		events: activity.events
			? activity.events.map((event) => {
				return {
					...event,
					start: getUtcTimestamp(event.start),
					end: event.end ? getUtcTimestamp(event.end) : undefined,
					repeatEnd: event.repeatEnd
						? getUtcTimestamp(event.repeatEnd)
						: undefined,
					recurrenceId: event.recurrenceId
						? getUtcTimestamp(event.recurrenceId)
						: undefined,
					exceptionDates: event.exceptionDates
						? event.exceptionDates.map((date) => {
							return getUtcTimestamp(date);
							  })
						: [],
					alarmDismissed: event.alarmDismissed
						? event.alarmDismissed.map((date) => {
							return getUtcTimestamp(date);
							  })
						: [],
				};
			  })
			: [],
	};
};

const updateActivityStructure = (document: Activity): Activity => {
	// Moving archived from boolean to date
	if ((document.archived as any) === true) {
		document.archived = getLocalDate();
	} else if ((document.archived as any) === false) {
		document.archived = undefined;
	}
	return document;
};

export const reParseAllDocuments = () => {
	const activityStore = useActivityStore();
	activityStore
		.find({
			selector: {
				type: {
					$exists: true,
				},
			},
		})
		.then((documents) => {
			if (!documents) {
				return;
			}
			documents.forEach((document) => {
				activityStore.update(updateActivityStructure(document));
			});
			useNoticeStore().addNotice({
				type: NoticeType.Success,
				title: documents.length + ' activities re-parsed',
			});
		});
};
