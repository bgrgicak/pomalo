import type Activity from './activity';

export enum ActivityFilterGroup {
    Project = 'project',
    Completed = 'completed',
}

export enum ActivityFilterSort {
    Priority = 'priority',
    DueDate = 'due-date',
    Name = 'name',
    Created = 'created',
}

export enum ActivityFilterStatus {
    Any = 'any',
    Completed = 'completed',
    NotCompleted = '',
}

export interface ActivityFilterState {
    status?: ActivityFilterStatus;
    project?: string;
    group?: ActivityFilterGroup;
    sort?: ActivityFilterSort;
}

export interface ActivityGroup {
    name: string;
    activityId?: string;
    activities: Activity[];
}