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

export interface ActivityFilterState {
    completed?: boolean;
    project?: string;
    group?: ActivityFilterGroup;
    sort?: ActivityFilterSort;
}