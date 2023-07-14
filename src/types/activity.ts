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

export interface ActivityInvite {
    email: string;
    status: string;
}

export type ActivityType = 'task' | 'event' | 'project';

export default interface Activity {
    _id?: string;
    _rev?: string;
    name: string;
    description?: string;
    type?: ActivityType;
    invites?: ActivityInvite[];
    schedules?: ActivitySchedule[];
    completed?: boolean;
}