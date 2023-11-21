import __ from '@/helper/translations';
import exp from 'constants';

export enum Importance {
    NotImportant = 1,
    SomewhatImportant = 3,
    Important = 5,
    VeryImportant = 7,
    ExtremelyImportant = 9,
};

export const ImportanceLabels: Object = {
	[Importance.NotImportant]: {
		label: __('Not Important'),
	},
	[Importance.SomewhatImportant]: {
		label: __('Somewhat Important'),
		default: true,
	},
	[Importance.Important]: {
		label: __('Important'),
	},
	[Importance.VeryImportant]: {
		label: __('Very Important'),
	},
	[Importance.ExtremelyImportant]: {
		label: __('Extremely Important'),
	},
};

export enum RepeatInterval {
    NoRepeat = '',
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
    Yearly = 'yearly',
    Custom = 'custom',
};
export const RepeatLabels: Object = {
	[RepeatInterval.NoRepeat]: {
		label: __('Don\'t Repeat'),
		default: true,
	},
	[RepeatInterval.Daily]: {
		label: __('Daily'),
	},
	[RepeatInterval.Weekly]: {
		label: __('Weekly'),
	},
	[RepeatInterval.Monthly]: {
		label: __('Monthly'),
	},
	[RepeatInterval.Yearly]: {
		label: __('Yearly'),
	},
};

export interface ActivityEventAttendee {
    email: string,
    status: string,
};

export enum ActivityEventStatus {
    None = '',
    Tentative = 'TENTATIVE',
    Confirmed = 'CONFIRMED',
    Cancelled = 'CANCELLED',
    Declined = 'DECLINED',
};

export enum ActivityEventTransparency {
    None = '',
    Transparent = 'TRANSPARENT',
    Opaque = 'OPAQUE',
};

export interface ActivityEventLink {
    title?: string,
    url: string,
};

export enum ActivityEventClass {
    None = '',
    Public = 'PUBLIC',
    Private = 'PRIVATE',
    Confidential = 'CONFIDENTIAL',
};

export interface ActivityEvent {
    id: string,
    start: Date,
    end?: Date,
    allDay?: boolean,
    repeat?: RepeatInterval,
    repeatEnd?: Date,
    repeatDays?: number[],
    repeatInterval?: number,
    recurrenceId?: Date,
    status?: ActivityEventStatus,
    attendees?: ActivityEventAttendee[],
    transparency?: ActivityEventTransparency,
    organizer?: ActivityEventAttendee,
    url?: string,
    attachment?: string,
    class?: ActivityEventClass,
    location?: string,
    exceptionDates?: Date[],
    sequence?: number,
    additionalDates?: Date[],
    geo?: {
        lat: number,
        lng: number,
    },
};

export interface ActivityMembers {
    email: string,
    status: string,
};

export enum ActivityType {
    Task = 'task',
    Event = 'event',
    Project = 'project',
    New = 'new', // used for creating new activities
};

export interface ActivityAlarm {
    weeks: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    isNegative: boolean,
};

export interface ActivityState {
    activity: Activity,
    isEditing: boolean,
};
interface Activity {
    _id: string,
    _rev?: string,
    title: string,
    created: Date,
    updated?: Date,
    description: string,
    type: ActivityType,
    parent?: string,
    archived?: Date,

    readonly?: boolean,

    members: ActivityMembers[],
    events: ActivityEvent[],
    alarms: ActivityAlarm[],

    completedDate?: Date,
    startDate?: Date,
    dueDate?: Date,
    estimatedHours?: number,

    aboveActivities: string[],
    belowActivities: string[],

    // Calculated values

    eventFirstStart?: Date,
    eventLastEnd?: Date,
    timerRunning?: boolean,

    calculatedEstimatedTime?: number,
    calculatedTimeSpent?: number,
};

export default Activity;