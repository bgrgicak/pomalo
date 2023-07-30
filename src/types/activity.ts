import __ from "@/helper/translations";

export enum Importance {
    NotImportant = 1,
    SomewhatImportant = 3,
    Important = 5,
    VeryImportant = 7,
    ExtremelyImportant = 9,
}

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
}
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
    [RepeatInterval.Custom]: {
        label: __('Custom'),
    },
};
export enum FrequencyInterval {
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
    Yearly = 'yearly',
}
export const FrequencyLabels: Object = {
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

export interface ActivityEvent {
    start: number;
    end?: number;
    allDay?: boolean;
    repeat?: RepeatInterval;
    repeatEnd?: number;
    // TODO refactor
    repeatFrequency?: FrequencyInterval;
    repeatInterval?: number;
    repeatDaysOfWeek?: number[];
}

export interface ActivityMembers {
    email: string;
    status: string;
}

export enum ActivityType {
    Task = 'task',
    Event = 'event',
    Project = 'project',
    New = 'new', // used for creating new activities
}

export interface ActivityState {
    activity: Activity;
    isEditing: boolean;
}

export default interface Activity {
    _id: string;
    _rev?: string;
    title: string;
    created: number;
    description: string;
    type: ActivityType;

    members: ActivityMembers[];
    events: ActivityEvent[];

    completedDate?: number;
    dueDate?: number;
    importance?: Importance;
    estimatedTime?: number;
}