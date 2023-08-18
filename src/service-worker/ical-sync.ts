import { emptyActivity } from "@/data/activities";
import { newEvent } from "@/data/events";
import { settings } from "@/helper/settings";
import { useActivityStore } from "@/stores/activities";
import { useSettingsStore } from "@/stores/settings";
import { ActivityType, RepeatInterval } from "@/types/activity";
// @ts-ignore-next-line
import ICAL from 'ical.js';

const syncIntervalMilliseconds = () => {
    const syncIntervalMinutes = useSettingsStore().get('calendarSyncInterval');
    return (
        syncIntervalMinutes ?? settings.calendar.syncIntervalMinutes
    ) * 60 * 1000;
};

const getCalendarUrls = (): string[] => {
    const calendars = useSettingsStore().get('calendarIcalUrls');
    return calendars.split('\n');
};

const syncCalendar = async (calendarUrl: string) => {
    const response = await fetch(
        settings.calendar.syncProxyServer + calendarUrl,
        {
            method: 'GET',
            redirect: 'follow',
        }
    );
    const jcalData = ICAL.parse(await response.text());
    const comp = new ICAL.Component(jcalData);
    comp.getAllSubcomponents('vevent').forEach((vEvent: any) => {
        const event = new ICAL.Event(vEvent);
        const activity = emptyActivity(ActivityType.Event);

        activity._id = 'event' + event.uid;
        activity.title = event.summary;
        activity.description = event.description;

        activity.readonly = true;
        activity.remoteId = event.uid;
        const activityEvent = newEvent(
            event.startDate.toJSDate(),
            event.endDate.toJSDate()
        );
        activityEvent.id = 'activityEvent' + event.uid;
        if (event.isRecurring()) {
            const type = Object.keys(event.getRecurrenceTypes());
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
        activity.events = [activityEvent];
        useActivityStore().addOrUpdate(activity);
    });
};

const syncAllCalendars = async () => {
    console.log('Syncing all calendars');
    const calendars = getCalendarUrls();
    calendars.forEach(async (calendarUrl) => {
        await syncCalendar(calendarUrl);
    });
};

const startIcalSync = () => {
    console.log('Initializing iCal sync service worker');
    console.log('Sync interval', syncIntervalMilliseconds());
    // const interval = setInterval(
    //     syncAllCalendars,
    //     syncIntervalMilliseconds()
    // );
    syncAllCalendars();
};

export default startIcalSync;