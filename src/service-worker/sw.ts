/* eslint-disable indent */
import { addMilliseconds, setTimezone, getLocalDate } from '@/helper/date';
import { settings } from '@/helper/settings';
import type Activity from '@/types/activity';
import {
	ActivityType,
	RepeatInterval,
	type ActivityEvent,
} from '@/types/activity';
// @ts-ignore-next-line
import ICAL from 'ical.js';

const isAllDayEvent = (event: any): boolean => {
	if (!event.endDate) {
		return false;
	}
	const start = event.startDate.toJSDate();
	const end = event.endDate.toJSDate();
	return (
		start.getHours() === 0 &&
		start.getMinutes() === 0 &&
		end.getHours() === 0 &&
		end.getMinutes() === 0
	);
};

const getEventEndFromRepeatCount = (
	start: Date,
	repeat?: RepeatInterval,
	repeatCount: number = 1
): Date => {
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

const getEmailFromAttendee = (attendee: string): string => {
	const emailRegex = /mailto:(.*)/g;
	const match = emailRegex.exec(attendee);
	if (match) {
		return match[1];
	}
	return '';
};

const parseDate = (date: any): Date => {
	let newDate = date.toJSDate();
	if (date.timezone && date.timezone !== 'Z') {
		newDate = setTimezone(newDate, date.timezone);
	}
	return getLocalDate(newDate);
};

const syncCalendar = async (calendarUrl: string, lastCalendarSync?: Date) => {
	fetch(settings.calendar.syncProxyServer + calendarUrl, {
		method: 'GET',
		redirect: 'follow',
	}).then(async (response) => {
		const jcalData = ICAL.parse(await response.text());
		const comp = new ICAL.Component(jcalData);
		const activities: { [key: string]: Activity } = {};
		const eventIds: string[] = [];
		// In Google Calendar, the calendar name is the same as the email address
		const calName = comp.getFirstPropertyValue('x-wr-calname');
		comp.getAllSubcomponents('vevent').forEach((vEvent: any) => {
			const event = new ICAL.Event(vEvent);
			const id = 'eventCalendar-' + event.uid;
			eventIds.push(id);
			const lastModified = parseDate(
				event.component.getFirstPropertyValue('last-modified')
			);
			if (lastCalendarSync && lastModified < lastCalendarSync) {
				return;
			}
			if (!activities[id]) {
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
				};
			} else {
				activities[id].title = event.summary;
				activities[id].description = event.description;
			}

			const start = parseDate(event.startDate);
			const end = parseDate(event.endDate);
			const recurrenceId =
				event.component.getFirstPropertyValue('recurrence-id') ??
				undefined;
			const activityEventId = 'activityEvent' + id + recurrenceId;
			const activityEvent: ActivityEvent = {
				id: activityEventId,
				start,
				end,
				transparency: event.component.getFirstPropertyValue('transp'),
				status: event.component.getFirstPropertyValue('status'),
				organizer: {
					email: getEmailFromAttendee(
						event.component.getFirstPropertyValue('organizer')
					),
					status: event.component.getFirstPropertyValue('status'),
				},
				attendees: [],
				exceptionDates: [],
			};
			activityEvent.allDay = isAllDayEvent(event);
			if (activityEvent.allDay && activityEvent.end) {
				activityEvent.end = addMilliseconds(activityEvent.end, -1);
			}
			if (event.isRecurring()) {
				const repeatRules =
					event.component.getFirstPropertyValue('rrule');
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
					activityEvent.repeatEnd = parseDate(repeatRules.until);
				} else if (repeatRules.count) {
					activityEvent.repeatEnd = addMilliseconds(
						getEventEndFromRepeatCount(
							activityEvent.start,
							activityEvent.repeat,
							repeatRules.count
						),
						-1
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
			if (recurrenceId) {
				activityEvent.recurrenceId = parseDate(recurrenceId);
			}
			event.component
				.getAllProperties('attendee')
				.forEach((attendeeData: any) => {
					if (
						attendeeData.jCal &&
						attendeeData.jCal[0] === 'attendee'
					) {
						const attendee = attendeeData.jCal[1]?.cn;
						// @ts-ignore-next-line undefined
						activityEvent.attendees.push({
							email: attendee,
							status: attendeeData.jCal[1]?.partstat,
						});
						// If calendar owner is attendee, set status
						if (attendee === calName) {
							activityEvent.status =
								attendeeData.jCal[1]?.partstat;
						}
					}
				});
			event.component
				.getAllProperties('exdate')
				.forEach((exdateProp: any) => {
					const exdate = exdateProp.getFirstValue();
					// @ts-ignore-next-line undefined
					activityEvent.exceptionDates.push(parseDate(exdate));
				});
			event.component
				.getAllProperties('location')
				.forEach((locationProp: any) => {
					const location = locationProp.getFirstValue();
					activityEvent.location = location;
				});
			event.component
				.getAllProperties('sequence')
				.forEach((prop: any) => {
					const value = prop.getFirstValue();
					activityEvent.sequence = value;
				});
			event.component.getAllProperties('url').forEach((prop: any) => {
				const value = prop.getFirstValue();
				activityEvent.url = value;
			});
			event.component.getAllProperties('attach').forEach((prop: any) => {
				const value = prop.getFirstValue();
				activityEvent.attachment = value;
			});
			event.component.getAllProperties('class').forEach((prop: any) => {
				const value = prop.getFirstValue();
				activityEvent.class = value;
			});
			activities[id].events = [...activities[id].events, activityEvent];
			event.component
				.getAllSubcomponents('valarm')
				.forEach((alarm: any) => {
					const alarmEvent = new ICAL.Event(alarm);
					const trigger =
						alarmEvent.component.getFirstPropertyValue('trigger');
					if (
						trigger.weeks ||
						trigger.days ||
						trigger.hours ||
						trigger.minutes ||
						trigger.seconds
					) {
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
			calendarUrl,
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
