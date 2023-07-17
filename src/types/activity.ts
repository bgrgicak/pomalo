export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ScheduleReoccurrence {
    frequency: ScheduleFrequency;
    interval: number;
}

export interface ActivitySchedule {
    start: Date;
    end: Date;
    reoccurrence: ScheduleReoccurrence;
}

export interface ActivityMembers {
    email: string;
    status: string;
}

export enum ActivityType {
    Task = 'task',
    Event = 'event',
    Project = 'project',
}

export default interface Activity {
    _id: string;
    _rev?: string;
    title: string;
    created: Date;
    description?: string;
    type?: ActivityType;
    members?: ActivityMembers[];
    schedules?: ActivitySchedule[];
    completed?: boolean;
}