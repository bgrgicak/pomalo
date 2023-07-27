import type Activity from "@/types/activity";
import type { ActivityEvent, ActivityType } from "@/types/activity";
import Router from '@/router/router';
import { getLocalDate, getUtcTimestamp } from "./date";
import type { CalendarEvent } from "@/types/calendar";

export const newActivityId = (type: string): string => {
    return [
        type,
        0, // if user isn't logged in, use 0
        getUtcTimestamp() + Math.random(),
    ].join('');
};

export const emptyActivity = (type: ActivityType): Activity => {
    return {
        _id: newActivityId(type),
        title: '',
        description: '',
        type,
        created: getUtcTimestamp(),
        members: [],
        events: [],
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


export const parseEventsFromActivities = (activities: Activity[], startTime: number, endTime: number, currentActivityId?: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    if (activities) {
        activities.forEach((activity: Activity) => {
            activity.events
                .filter((event: ActivityEvent) => {
                    return event.start >= startTime && event.start <= endTime;
                })
                .forEach((event) => {
                    const isCurrentActivity = currentActivityId === activity._id;
                    events.push({
                        id: activity._id,
                        title: activity.title,
                        start: getLocalDate(event.start),
                        end: event.end ? getLocalDate(event.end) : getLocalDate(),
                        content: '',
                        class: 'calendar-event__' + activity.type,
                        deletable: isCurrentActivity,
                        resizable: isCurrentActivity,
                        background: isCurrentActivity,
                    });
                });
        });
    }
    return events;
};