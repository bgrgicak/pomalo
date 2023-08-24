import type Activity from '@/types/activity';
import { RepeatInterval, type ActivityEvent } from '@/types/activity';
import { daysBetweenDates, getLocalDate, getWeekStartAndEnd, weeksBetweenDates } from '../helper/date';
import type { CalendarEvent } from '@/types/calendar';
import { newId } from './pouchdb';

export const getEventFromActivity = (activity: Activity, eventId: string): ActivityEvent | undefined => {
	return activity.events.find(event => event.id === eventId);
};

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

export const updateEventFieldInActivity = (activity: Activity, event: ActivityEvent, field: string, value: any): Activity => {
	const newEvent = {
		...event,
		[field]: value,
	};
	return updateEventInActivity(activity, newEvent);
};

export const newEvent = (start: Date, end?: Date): ActivityEvent => {
	return {
		id: newId('activityEvent'),
		start,
		end,
	};
};

export const calendarEventToActivityEvent = (event: CalendarEvent): ActivityEvent => {
	return {
		id: event.eventId,
		start: event.start,
		end: event.end,
	};
};

const isInInterval = (day: Date, event: ActivityEvent): boolean => {
	if (undefined === event.repeatInterval) {
		return true;
	}
	let between = 0;
	if (event.repeat === RepeatInterval.Daily) {
		between = daysBetweenDates(day, event.start);
	} else if (event.repeat === RepeatInterval.Weekly) {
		between = weeksBetweenDates(
			getWeekStartAndEnd(day).end,
			getWeekStartAndEnd(event.start).end
		);
	} else if (event.repeat === RepeatInterval.Monthly) {
		between = day.getMonth() - event.start.getMonth();
	} else if (event.repeat === RepeatInterval.Yearly) {
		between = day.getFullYear() - event.start.getFullYear();
	}
	if (between % event.repeatInterval === 0) {
		return true;
	}
	return false;
};

const isDayInRepeatCycle = (day: Date, event: ActivityEvent): boolean => {
	if (!isInInterval(day, event)) {
		return false;
	}
	if (event.repeat === RepeatInterval.Daily) {
		return true;
	} else if (event.repeat === RepeatInterval.Weekly) {
		if (!event.repeatDays) {
			return day.getDay() === event.start.getDay();
		}
		return event.repeatDays.includes(day.getDay());
	} else if (event.repeat === RepeatInterval.Monthly) {
		return event.start.getDate() === day.getDate();
	} else if (event.repeat === RepeatInterval.Yearly) {
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
					const isEditable = !isCurrentActivity && true !== activity.readonly;

					let className = 'v-card calendar-event__' + activity.type;
					if (true === activity.readonly) {
						className += ' calendar-event__readonly';
					}
					const eventData = {
						id: activity._id,
						title: activity.title,
						content: '',
						class: className,
						deletable: false,
						resizable: isEditable,
						draggable: isEditable,
						background: false,
						eventId: event.id,
						allDay: event.allDay,
						repeatIteration: false,
					};
					if (event.repeat) {
						const iteratorDay = structuredClone(
							startTime.getTime() > event.start.getTime()
								? startTime : event.start
						);
						let lastDay = event.repeatEnd;
						if (!lastDay || lastDay > endTime) {
							lastDay = endTime;
						}
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
								} as CalendarEvent);
							}
							iteratorDay.setDate(iteratorDay.getDate() + 1);
						}

					} else {
						events.push({
							...eventData,
							start: event.start,
							end: endDay,
						} as CalendarEvent);
					}
				});
		});
	};
	return events;
};