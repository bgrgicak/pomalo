import type Activity from "@/types/activity";
import type { ActivityEvent, ActivityType } from "@/types/activity";
import Router from '@/router/router';
import { getLocalDate, getUtcTimestamp } from "../helper/date";
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

export const isDayInCustomFrequency = (day: Date, event: ActivityEvent): boolean => {
    // TODO finish and debug this function
    if (event.repeatFrequency === 'daily') {
        const oneDay = 1000 * 60 * 60 * 24;
        const diffInTime = day.getTime() - getLocalDate(event.start).getTime();
        const diffInDays = Math.round(diffInTime / oneDay);
        return diffInDays % event.repeatInterval === 0;
    } else if (event.repeatFrequency === 'weekly') {
        return event.repeatDaysOfWeek.includes(day.getDay());
    } else if (event.repeatFrequency === 'monthly') {
        return event.repeatInterval === day.getDate();
    } else if (event.repeatFrequency === 'yearly') {
        return event.repeatInterval === day.getMonth() && event.repeatDaysOfWeek.includes(day.getDay());
    }
    return false;
};

export const isDayInRepeatCycle = (day: Date, event: ActivityEvent): boolean => {
    if (event.repeat === 'daily') {
        return true;
    } else if (event.repeat === 'weekly') {
        return event.repeatDaysOfWeek.includes(day.getDay());
    } else if (event.repeat === 'monthly') {
        return event.repeatInterval === day.getDate();
    } else if (event.repeat === 'yearly') {
        return event.repeatInterval === day.getMonth() && event.repeatDaysOfWeek.includes(day.getDay());
    }
    return false;
};

export const parseEventsFromActivities = (activities: Activity[], startTime: number, endTime: number, currentActivityId?: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    if (activities) {
        activities.forEach((activity: Activity) => {
            activity.events
                .filter((event: ActivityEvent) => {
                    if (event.start > endTime) {
                        return false;
                    }
                    if (event.repeat) {
                        return !event.repeatEnd || event.repeatEnd >= startTime;
                    }
                    return event.end >= startTime;
                })
                .forEach((event) => {
                    const isCurrentActivity = currentActivityId === activity._id;
                    const startDay = getLocalDate(event.start);
                    const endDay = event.end ? getLocalDate(event.end) : getLocalDate();
                    if (event.repeat) {
                        const iteratorDay = Object.assign(new Date(), startDay);
                        const lastDay = getLocalDate(endTime);
                        while (iteratorDay <= lastDay) {
                            if (isDayInRepeatCycle(iteratorDay, event)) {
                                const eventStart = getLocalDate(iteratorDay);
                                eventStart.setHours(startDay.getHours());
                                eventStart.setMinutes(startDay.getMinutes());
                                const eventEnd = getLocalDate(iteratorDay);
                                eventEnd.setHours(endDay.getHours());
                                eventEnd.setMinutes(endDay.getMinutes());

                                events.push({
                                    id: activity._id,
                                    title: activity.title,
                                    start: eventStart,
                                    end: eventEnd,
                                    allDay: event.allDay,
                                    content: '',
                                    class: 'calendar-event__' + activity.type,
                                    deletable: isCurrentActivity,
                                    resizable: isCurrentActivity,
                                    background: isCurrentActivity,
                                });
                            }
                            iteratorDay.setDate(iteratorDay.getDate() + 1);
                        }

                    } else {
                        events.push({
                            id: activity._id,
                            title: activity.title,
                            start: startDay,
                            end: endDay,
                            allDay: event.allDay,
                            content: '',
                            class: 'calendar-event__' + activity.type,
                            deletable: isCurrentActivity,
                            resizable: isCurrentActivity,
                            background: isCurrentActivity,
                        });
                    }
                });
        });
    };
    return events;
};