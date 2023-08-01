import type Activity from "@/types/activity";
import type { ActivityEvent } from "@/types/activity";
import { getLocalDate } from "../helper/date";
import type { CalendarEvent } from "@/types/calendar";
import { newId } from "./pouchdb";

export const addEventToActivity = (activity: Activity, event: ActivityEvent): Activity => {
    const newActivity = { ...activity };
    newActivity.events.push(event);
    return newActivity;
};

export const removeEventFromActivity = (activity: Activity, eventId: string): Activity => {
    const newActivity = { ...activity };
    newActivity.events = newActivity.events.filter(event => event.id !== eventId);
    return newActivity;
};

export const updateEventInActivity = (activity: Activity, event: ActivityEvent, repeatIteration: boolean = false): Activity => {
    const newActivity = { ...activity };
    newActivity.events = newActivity.events.map((oldEvent) => {
        if (oldEvent.id === event.id) {
            let start = structuredClone(event.start);
            let end = structuredClone(event.end);
            if (repeatIteration) {
                start.setDate(oldEvent.start.getDate());
                if (end) {
                    end.setDate(end.getDate());
                }
            }
            return {
                ...oldEvent,
                ...event,
                start,
                end,
            };
        }
        return oldEvent;
    });
    return newActivity;
};

export const newEvent = (start: Date, end?: Date): ActivityEvent => {
    return {
        id: newId('activityEvent'),
        start,
        end,
    };
};

const isDayInRepeatCycle = (day: Date, event: ActivityEvent): boolean => {
    if (event.repeat === 'daily') {
        return true;
    } else if (event.repeat === 'weekly') {
        if (!event.repeatDays) {
            return day.getDay() === event.start.getDay();
        }
        return event.repeatDays.includes(day.getDay());
    } else if (event.repeat === 'monthly') {
        return event.start.getDate() === day.getDate();
    } else if (event.repeat === 'yearly') {
        return event.start.getDate() === day.getDate() && event.start.getMonth() === day.getMonth();
    }
    return false;
};

export const parseEventsFromActivities = (activities: Activity[], startTime: Date, endTime: Date, currentActivityId?: string): CalendarEvent[] => {
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
                    return !event.end || event.end >= startTime;
                })
                .forEach((event) => {
                    const isCurrentActivity = currentActivityId === activity._id;
                    const endDay = event.end ? event.end : getLocalDate();
                    const eventData = {
                        id: activity._id,
                        eventId: event.id,
                        title: activity.title,
                        content: '',
                        allDay: event.allDay,
                        class: 'v-card calendar-event__' + activity.type,
                        deletable: !isCurrentActivity,
                        resizable: !isCurrentActivity,
                        background: isCurrentActivity,
                        repeatIteration: false,
                    };
                    if (event.repeat) {
                        const iteratorDay = structuredClone(event.start);
                        const lastDay = !event.repeatEnd ? endTime : event.repeatEnd;
                        while (iteratorDay <= lastDay) {
                            if (isDayInRepeatCycle(iteratorDay, event)) {
                                const eventStart = structuredClone(iteratorDay);
                                eventStart.setHours(event.start.getHours());
                                eventStart.setMinutes(event.start.getMinutes());
                                const eventEnd = structuredClone(iteratorDay);
                                eventEnd.setHours(endDay.getHours());
                                eventEnd.setMinutes(endDay.getMinutes());

                                const isRepeatIteration = !(
                                    event.start.getTime() === eventStart.getTime() &&
                                    endDay.getTime() === eventEnd.getTime()
                                );
                                events.push({
                                    ...eventData,
                                    start: eventStart,
                                    end: eventEnd,
                                    repeatIteration: isRepeatIteration,
                                });
                            }
                            iteratorDay.setDate(iteratorDay.getDate() + 1);
                        }

                    } else {
                        events.push({
                            ...eventData,
                            start: event.start,
                            end: endDay,
                        });
                    }
                });
        });
    };
    return events;
};