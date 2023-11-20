import type Activity from '@/types/activity';
import { RepeatInterval, type ActivityEvent, ActivityEventStatus } from '@/types/activity';
import { daysBetweenDates, getWeekStartAndEnd, copyTimeFromDate, weeksBetweenDates, getLocalDate } from '../helper/date';
import type { CalendarEvent } from '@/types/calendar';
import { newId } from './pouchdb';
import { getCalendarUrls, resetLastCalendarSync } from '../service-worker/ical-sync';
import { useActivityStore } from '../stores/activities';
import { useNoticeStore } from '../stores/notices';
import { NoticeType } from '../types/notice';
import { useProjectStore } from '../stores/projects';

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

export const newCalendarEvent = (start: Date, end?: Date): CalendarEvent => {
	const event = newEvent(start, end);
	return {
		eventId: event.id,
		start: event.start,
		end: event.end,
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

const defaultCalendarEvent = (activity: Activity, event: ActivityEvent, isCurrentActivity: boolean = false): CalendarEvent => {
	const projectStore = useProjectStore();
	const isEditable = !isCurrentActivity && true !== activity.readonly;

	const content = activity.parent ? projectStore.getTitle(activity.parent) : '';

	let className = 'v-card prevent-outside-close calendar-event__' + activity.type;
	if (true === activity.readonly) {
		className += ' calendar-event__readonly';
	}
	if (activity.completedDate) {
		className += ' calendar-event__completed';
	}
	return {
		id: activity._id,
		title: activity.title,
		content,
		class: className,
		deletable: false,
		resizable: isEditable,
		draggable: isEditable,
		background: false,
		eventId: event.id,
		allDay: event.allDay,
		repeatIteration: false,
		start: undefined as Date | undefined,
		end: undefined as Date | undefined,
		recurrenceId: event.recurrenceId,
	} as CalendarEvent;
};

const getRecurrenceEvents = (activity: Activity, startTime: Date, endTime: Date) => {
	const recurrenceEvents: {[key:string]: ActivityEvent} = {};
	activity.events.forEach((event: ActivityEvent) => {
		if ( event.recurrenceId && event.recurrenceId >= startTime && event.recurrenceId <= endTime ) {
			recurrenceEvents[event.recurrenceId.toString()] = event;
		}
	} );
	return recurrenceEvents;
};

export const parseEventsFromActivities = (activities: Activity[], startTime: Date, endTime: Date, currentActivityId?: string): CalendarEvent[] => {
	const events: CalendarEvent[] = [];
	const addEvent = (event: CalendarEvent) => {
		events.push( {
			...event
		} );
	};
	if (activities) {
		activities.forEach((activity: Activity) => {
			const recurrenceEvents = getRecurrenceEvents(activity, startTime, endTime);
			activity.events
				.filter((event: ActivityEvent) => {
					if (event.status === ActivityEventStatus.Cancelled || event.status === ActivityEventStatus.Declined) {
						return false;
					}
					if (event.start > endTime) {
						return false;
					}
					if (event.recurrenceId) {
						return false;
					}
					if (activity.archived && startTime > activity.archived) {
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
					const eventData = defaultCalendarEvent(activity, event, isCurrentActivity);
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
							// Check if there is a recurrence event for this day
							if ( recurrenceEvents[iteratorDay.toString()] ) {
								const recurrenceEvent = recurrenceEvents[iteratorDay.toString()];
								addEvent({
									...eventData,
									start: recurrenceEvent.start,
									end: recurrenceEvent.end ? recurrenceEvent.end : getLocalDate(),
								});
							} else if (isDayInRepeatCycle(iteratorDay, event)) {
								const eventStart = copyTimeFromDate(
									iteratorDay,
									event.start
								);
								const eventEnd = copyTimeFromDate(
									iteratorDay,
									endDay
								);

								const isRepeatIteration = !(
									event.start.getTime() === eventStart.getTime() &&
                                    endDay.getTime() === eventEnd.getTime()
								);

								addEvent({
									...eventData,
									start: eventStart,
									end: eventEnd,
									repeatIteration: isRepeatIteration,
								});
							}
							iteratorDay.setDate(iteratorDay.getDate() + 1);
						}

					} else {
						addEvent({
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

export const removeAllCalendarEvents = () => {
	getCalendarUrls().forEach(async (calendarUrl) => {
		const activityStore = useActivityStore();
		activityStore.find({
			selector: {
				'parent': {
					'$eq': calendarUrl
				}
			},
		}).then((documents) => {
			if (!documents) {
				return;
			}
			documents.forEach((document) => {
				activityStore.remove(document._id);
			});
			resetLastCalendarSync(calendarUrl);
		});
		useNoticeStore().addNotice(
			{
				type: NoticeType.Success,
				title: 'All calendar events were removed',
			}
		);
	});
};
