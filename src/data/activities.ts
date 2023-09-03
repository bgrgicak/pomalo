import type Activity from '@/types/activity';
import type { ActivityEvent, ActivityType } from '@/types/activity';
import Router from '@/router/router';
import { getLocalDate, getUtcTimestamp, addDays, maxDate } from '../helper/date';
import { newId } from './pouchdb';
import type { ActivityDocument } from '@/types/activity-document';
import { getEstimatedDays, getEstimatedHours, getWorkedTime } from './priority';
import { useActivityStore } from '@/stores/activities';
import { useNoticeStore } from '@/stores/notices';
import { NoticeType } from '@/types/notice';
import { settings } from '@/helper/settings';
import { debug } from '@/helper/logs';

export const getActivityLink = (activity: Activity): string => {
	return `/${activity.type}/${activity._id}/`;
};

export const emptyActivity = (type: ActivityType): Activity => {
	return {
		_id: newId(type),
		title: '',
		description: '',
		type,
		created: new Date(),
		members: [],
		events: [],
		aboveActivities: [],
		belowActivities: [],
		calculatedEstimatedTime: 0,
		calculatedTimeSpent: 0,
		archived: false,
	};
};

export const addDefaultsToActivity = (activity: Activity): Activity => {
	return {
		...emptyActivity(activity.type),
		...activity,
	};
};

export const openActivityPage = async (activity: Activity) => {
	return Router.push(`/${activity.type}/${activity._id}/`);
};

export const calculateActivityStartEndDate = (activity: Activity) => {
	let eventFirstStart: Date | undefined = activity.startDate;
	let eventLastEnd: Date | undefined = activity.dueDate;
	if (activity.events.length > 0) {
		activity.events.forEach((event) => {
			if (undefined === eventFirstStart || event.start < eventFirstStart) {
				eventFirstStart = event.start;
			}
			if (event.repeat) {
				if (
					event.repeatEnd && (
						undefined === eventLastEnd || event.repeatEnd > eventLastEnd
					)
				) {
					eventLastEnd = event.repeatEnd;
				} else {
					eventLastEnd = maxDate();
				}
			} else if (
				event.end && (
					undefined === eventLastEnd || event.end > eventLastEnd
				)
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
	return {
		eventFirstStart,
		eventLastEnd,
	};
};

const isTimerRunning = (activity: Activity): boolean => {
	if (activity.events.length > 0) {
		return -1 < activity.events.findIndex((event: ActivityEvent) => {
			return !event.end;
		});
	}
	return false;
};

export const calculateActivity = (activity: Activity): Activity => {
	const computedActivity = { ...activity };

	const { eventFirstStart, eventLastEnd } = calculateActivityStartEndDate(activity);
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
		completedDate: doc.completedDate ? getLocalDate(doc.completedDate) : undefined,
		startDate: doc.startDate ? getLocalDate(doc.startDate) : undefined,
		dueDate: doc.dueDate ? getLocalDate(doc.dueDate) : undefined,
		eventFirstStart: doc.eventFirstStart ? getLocalDate(doc.eventFirstStart) : undefined,
		eventLastEnd: doc.eventLastEnd ? getLocalDate(doc.eventLastEnd) : undefined,
		events: doc.events ? doc.events.map((event) => {
			return {
				...event,
				start: getLocalDate(event.start),
				end: event.end ? getLocalDate(event.end) : undefined,
				repeatEnd: event.repeatEnd ? getLocalDate(event.repeatEnd) : undefined,
			};
		}) : [],
	};
};

export const parseActivityToDocument = (activity: Activity): ActivityDocument => {
	return {
		...activity,
		created: getUtcTimestamp(activity.created),
		completedDate: activity.completedDate ? getUtcTimestamp(activity.completedDate) : undefined,
		startDate: activity.startDate ? getUtcTimestamp(activity.startDate) : undefined,
		dueDate: activity.dueDate ? getUtcTimestamp(activity.dueDate) : undefined,
		eventFirstStart: activity.eventFirstStart ? getUtcTimestamp(activity.eventFirstStart) : undefined,
		eventLastEnd: activity.eventLastEnd ? getUtcTimestamp(activity.eventLastEnd) : undefined,
		events: activity.events ? activity.events.map((event) => {
			return {
				...event,
				start: getUtcTimestamp(event.start),
				end: event.end ? getUtcTimestamp(event.end) : undefined,
				repeatEnd: event.repeatEnd ? getUtcTimestamp(event.repeatEnd) : undefined,
			};
		}) : [],
	};
};

export const reParseAllDocuments = () => {
	const activityStore = useActivityStore();
	activityStore.find({
		selector: {
			'type': {
				'$exists': true
			}
		},
	}).then((documents) => {
		if (!documents) {
			return;
		}
		documents.forEach((document) => {
			activityStore.update(document);
		});
		useNoticeStore().addNotice(
			{
				type: NoticeType.Success,
				title: documents.length + ' activities re-parsed',
			}
		);
	});
};