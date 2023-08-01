import type Activity from "@/types/activity";
import type { ActivityEvent, ActivityType } from "@/types/activity";
import Router from '@/router/router';
import { getLocalDate, getUtcTimestamp, maxDate } from "../helper/date";
import { newId } from "./pouchdb";
import type { ActivityDocument } from "@/types/activity-document";

export const emptyActivity = (type: ActivityType): Activity => {
    return {
        _id: newId(type),
        title: '',
        description: '',
        type,
        created: new Date(),
        members: [],
        events: [],
        priority: 0,
        aboveActivities: [],
        belowActivities: [],
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

const calculateActivityPriority = (activity: Activity): number => {
    const timeLeft = activity.dueDate ? getUtcTimestamp(activity.dueDate) - getUtcTimestamp() : 365;
    const estimatedTime = activity.estimatedTime ? activity.estimatedTime / 8 : 1;
    return timeLeft / estimatedTime / 365;
};

const calculateActivityStartEndDate = (activity: Activity) => {
    let eventFirstStart = undefined;
    let eventLastEnd = undefined;
    if (activity.events.length > 0) {
        eventFirstStart = activity.events[0].start;
        if (activity.events[0].repeat) {
            eventLastEnd = activity.events[0].repeatEnd;
        } else {
            eventLastEnd = activity.events[0].end;
        }
        activity.events.forEach((event) => {
            if (event.start < eventFirstStart) {
                eventFirstStart = event.start;
            }
            if (event.repeat) {
                if (event.repeatEnd && event.repeatEnd > eventLastEnd) {
                    eventLastEnd = event.repeatEnd;
                }
            } else if (event.end && event.end > eventLastEnd) {
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

    computedActivity.priority = calculateActivityPriority(activity);

    computedActivity.timerRunning = isTimerRunning(activity);
    return computedActivity;
};

export const parseDocumentToActivity = (doc: ActivityDocument): Activity => {
    return {
        ...doc,
        created: getLocalDate(doc.created),
        completedDate: doc.completedDate ? getLocalDate(doc.completedDate) : undefined,
        dueDate: doc.dueDate ? getLocalDate(doc.dueDate) : undefined,
        eventFirstStart: doc.eventFirstStart ? getLocalDate(doc.eventFirstStart) : undefined,
        eventLastEnd: doc.eventLastEnd ? getLocalDate(doc.eventLastEnd) : undefined,
        events: doc.events.map((event) => {
            return {
                ...event,
                start: getLocalDate(event.start),
                end: event.end ? getLocalDate(event.end) : undefined,
                repeatEnd: event.repeatEnd ? getLocalDate(event.repeatEnd) : undefined,
            };
        }),
    };
};

export const parseActivityToDocument = (activity: Activity): ActivityDocument => {
    return {
        ...activity,
        created: getUtcTimestamp(activity.created),
        completedDate: activity.completedDate ? getUtcTimestamp(activity.completedDate) : undefined,
        dueDate: activity.dueDate ? getUtcTimestamp(activity.dueDate) : undefined,
        eventFirstStart: activity.eventFirstStart ? getUtcTimestamp(activity.eventFirstStart) : undefined,
        eventLastEnd: activity.eventLastEnd ? getUtcTimestamp(activity.eventLastEnd) : undefined,
        events: activity.events.map((event) => {
            return {
                ...event,
                start: getUtcTimestamp(event.start),
                end: event.end ? getUtcTimestamp(event.end) : undefined,
                repeatEnd: event.repeatEnd ? getUtcTimestamp(event.repeatEnd) : undefined,
            };
        }),
    };
};