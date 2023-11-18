import { addMilliseconds, getLocalDate } from '@/helper/date';
import { settings } from '@/helper/settings';
import type Activity from '@/types/activity';
import { ActivityType, RepeatInterval, type ActivityEvent } from '@/types/activity';
// @ts-ignore-next-line
import ICAL from 'ical.js';
import { debug } from '../helper/logs';


const isAllDayEvent = (event: ActivityEvent): boolean => {
	if (!event.end) {
		return false;
	}
	return event.start.getHours() === 0
        && event.start.getMinutes() === 0
        && event.end.getHours() === 0
        && event.end.getMinutes() === 0;
};

const getEventEndFromRepeatCount = (start: Date, repeat?: RepeatInterval, repeatCount: number = 1): Date => {
	const end = structuredClone(start);
	if (repeat === RepeatInterval.Daily) {
		return getLocalDate(end.setDate(end.getDate() + repeatCount));
	} else if (repeat === RepeatInterval.Weekly) {
		return getLocalDate(end.setDate(end.getDate() + repeatCount * 7));
	} else if (repeat === RepeatInterval.Monthly) {
		return getLocalDate(end.setMonth(end.getMonth() + repeatCount));
	} else if (repeat === RepeatInterval.Yearly) {
		return getLocalDate(end.setFullYear(end.getFullYear() + repeatCount));
	}
	return end;
};

const syncCalendar = async (calendarUrl: string, lastCalendarSync?: Date) => {
	fetch(
		settings.calendar.syncProxyServer + calendarUrl,
		{
			method: 'GET',
			redirect: 'follow',
		}
	).then(async (response) => {
		const jcalData = ICAL.parse(await response.text());
		const comp = new ICAL.Component(jcalData);
		const activities: { [key: string]: Activity } = {};
		const eventIds: string[] = [];
		comp.getAllSubcomponents('vevent').forEach((vEvent: any) => {
			const event = new ICAL.Event(vEvent);
			const id = 'eventCalendar-' + event.uid;
			eventIds.push(id);
			const lastModified = event.component.getFirstPropertyValue('last-modified').toJSDate();
			if ( event.summary === 'Team Fire sync call' ) {
				debug(vEvent.jCal[1]);
			}

			if (lastCalendarSync && lastModified < lastCalendarSync) {
				return;
			}
			if ( ! activities[id] ) {
				activities[id] = {
					_id: id,
					title: event.summary,
					description: event.description,
					created: getLocalDate(),
					type: ActivityType.Event,
					readonly: true,
					parent: calendarUrl,
					members: [],
					events: [],
					alarms: [],
					aboveActivities: [],
					belowActivities: [],
				};
			} else {
				activities[id].title = event.summary;
				activities[id].description = event.description;
			}

			const activityEventId = 'activityEvent'
				+ id
				+ event.startDate.toJSDate().getTime()
				+ event.endDate.toJSDate().getTime();
			const activityEvent: ActivityEvent = {
				id: activityEventId,
				start: getLocalDate(event.startDate.toJSDate()),
				end: getLocalDate(event.endDate.toJSDate()),
				status: event.component.getFirstPropertyValue('status'),
			};
			activityEvent.allDay = isAllDayEvent(activityEvent);
			if (activityEvent.allDay && activityEvent.end) {
				activityEvent.end = addMilliseconds(activityEvent.end, - 1);
			}
			if (event.isRecurring()) {
				const repeatRules = event.component.getFirstPropertyValue('rrule');
				if (repeatRules.freq) {
					switch (repeatRules.freq) {
					case 'DAILY':
						activityEvent.repeat = RepeatInterval.Daily;
						break;
					case 'WEEKLY':
						activityEvent.repeat = RepeatInterval.Weekly;
						break;
					case 'MONTHLY':
						activityEvent.repeat = RepeatInterval.Monthly;
						break;
					case 'YEARLY':
						activityEvent.repeat = RepeatInterval.Yearly;
						break;
					default:
						activityEvent.repeat = RepeatInterval.NoRepeat;
					}
				}
				if (repeatRules.until) {
					activityEvent.repeatEnd = getLocalDate(
						repeatRules.until.toJSDate()
					);
				} else if (repeatRules.count) {
					activityEvent.repeatEnd = addMilliseconds(
						getEventEndFromRepeatCount(
							activityEvent.start,
							activityEvent.repeat,
							repeatRules.count
						), -1
					);
				}
				if (repeatRules.interval) {
					activityEvent.repeatInterval = repeatRules.interval ?? 1;
				}
				if (repeatRules?.parts?.BYDAY) {
					activityEvent.repeatDays = repeatRules.parts.BYDAY.map(
						(day: string) => {
							switch (day) {
							case 'MO':
								return 1;
							case 'TU':
								return 2;
							case 'WE':
								return 3;
							case 'TH':
								return 4;
							case 'FR':
								return 5;
							case 'SA':
								return 6;
							case 'SU':
								return 0;
							default:
								return 0;
							}
						}
					);
				}
			}
			const recurrenceId = event.component.getFirstPropertyValue('recurrence-id');
			if ( recurrenceId ) {
				activityEvent.recurrenceId = getLocalDate(
					recurrenceId.toJSDate()
				);
			}

			activities[id].events = [
				...activities[id].events,
				activityEvent
			];

			event.component.getAllSubcomponents('valarm').forEach((alarm: any) => {
				const alarmEvent = new ICAL.Event(alarm);
				const trigger = alarmEvent.component.getFirstPropertyValue('trigger');
				if (trigger.weeks || trigger.days || trigger.hours || trigger.minutes || trigger.seconds) {
					activities[id].alarms.push({
						weeks: trigger.weeks ?? 0,
						days: trigger.days ?? 0,
						hours: trigger.hours ?? 0,
						minutes: trigger.minutes ?? 0,
						seconds: trigger.seconds ?? 0,
						isNegative: trigger.isNegative ?? false,
					});
				}
			});
		});

		postMessage({
			type: 'calendar-sync',
			activities: Object.values(activities),
		});

		postMessage({
			type: 'calendar-sync-all-ids',
			eventIds,
			calendarUrl
		});
	});
};
onmessage = (event: MessageEvent) => {
	let { calendarUrl, lastCalendarSync } = JSON.parse(event.data);
	if (lastCalendarSync) {
		lastCalendarSync = getLocalDate(lastCalendarSync);
	}
	syncCalendar(calendarUrl, lastCalendarSync);
};
