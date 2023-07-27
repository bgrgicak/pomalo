import __ from "@/helper/translations";

export type EventFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

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

export interface EventReoccurrence {
    frequency: EventFrequency;
    interval: number;
}

export interface ActivityEvent {
    start: number;
    end?: number;
    reoccurrence?: EventReoccurrence;
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