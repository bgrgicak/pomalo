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
};

export interface ActivityEvent {
    id: string;
    start: Date;
    end?: Date;
    allDay?: boolean;
    repeat?: RepeatInterval;
    repeatEnd?: Date;
    repeatDays?: number[];
    repeatInterval?: number;
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
    created: Date;
    description: string;
    type: ActivityType;
    parent?: string;

    readonly?: boolean;
    remoteId?: string;

    members: ActivityMembers[];
    events: ActivityEvent[];

    completedDate?: Date;
    dueDate?: Date;
    estimatedHours?: number;

    aboveActivities: string[];
    belowActivities: string[];

    // Calculated values

    eventFirstStart?: Date;
    eventLastEnd?: Date;
    timerRunning?: boolean;

    calculatedEstimatedTime?: number;
    calculatedTimeSpent?: number;
}
