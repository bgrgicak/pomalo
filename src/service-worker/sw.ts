import { addMilliseconds, getLocalDate } from '@/helper/date';
import { debug, info } from '@/helper/logs';
import { settings } from '@/helper/settings';
import type Activity from '@/types/activity';
import { ActivityType, RepeatInterval, type ActivityEvent } from '@/types/activity';
// @ts-ignore-next-line
import ICAL from 'ical.js';


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
		return new Date(end.setDate(end.getDate() + repeatCount));
	} else if (repeat === RepeatInterval.Weekly) {
		return new Date(end.setDate(end.getDate() + repeatCount * 7));
	} else if (repeat === RepeatInterval.Monthly) {
		return new Date(end.setMonth(end.getMonth() + repeatCount));
	} else if (repeat === RepeatInterval.Yearly) {
		return new Date(end.setFullYear(end.getFullYear() + repeatCount));
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
		const eventIds: string[] = [];
		const activities: { [key: string]: Activity } = {};
		comp.getAllSubcomponents('vevent').forEach((vEvent: any) => {
			const event = new ICAL.Event(vEvent);
			const id = 'eventCalendar-' + event.uid;
			eventIds.push(id);

			const lastModified = event.component.getFirstPropertyValue('last-modified').toJSDate();
			if (lastCalendarSync && lastModified < lastCalendarSync ) {
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

			const activityEventId = 'activityEvent-' + btoa(encodeURIComponent(JSON.stringify(event)));
			const activityEvent: ActivityEvent = {
				id: activityEventId,
				start: event.startDate.toJSDate(),
				end: event.endDate.toJSDate()
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
					activityEvent.repeatEnd = repeatRules.until.toJSDate();
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

			postMessage({
				type: 'calendar-sync',
				activity: activities[id],
			});
		});

		postMessage({
			type: 'calendar-sync-all-ids',
			eventIds,
			calendarUrl
		});
	});
};
onmessage = (event: MessageEvent) => {
	const { calendarUrl, lastCalendarSync } = JSON.parse(event.data);
	syncCalendar(calendarUrl, new Date(lastCalendarSync));
};
