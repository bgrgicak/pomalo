import type Activity from '@/types/activity';
import type { ActivityEvent, ActivityType } from '@/types/activity';
import Router from '@/router/router';
import { getLocalDate, getUtcTimestamp, maxDate } from '../helper/date';
import { newId } from './pouchdb';
import type { ActivityDocument } from '@/types/activity-document';
import { getEstimatedHours, getWorkedTime } from './priority';
import { useActivityStore } from '@/stores/activities';

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
	let eventFirstStart: Date | undefined = undefined;
	let eventLastEnd: Date | undefined = undefined;
	if (activity.events.length > 0) {
		eventFirstStart = activity.events[0].start;
		if (activity.events[0].repeat) {
			eventLastEnd = activity.events[0].repeatEnd;
		} else {
			eventLastEnd = activity.events[0].end;
		}
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
	if (undefined === eventFirstStart) {
		eventFirstStart = getLocalDate(0);
	}
	if (undefined === eventLastEnd) {
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
	});
};