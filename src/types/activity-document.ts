import type { RepeatInterval, ActivityType, ActivityMembers } from "./activity";

export interface ActivityDocumentEvent {
    id: string;
    start: number;
    end?: number;
    allDay?: boolean;
    repeat?: RepeatInterval;
    repeatEnd?: number;
    repeatDays?: number[];
    repeatInterval?: number;
}
export interface ActivityDocument {
    _id: string;
    _rev?: string;
    title: string;
    created: number;
    description: string;
    type: ActivityType;

    members: ActivityMembers[];
    events: ActivityDocumentEvent[];

    completedDate?: number;
    dueDate?: number;
    estimatedHours?: number;

    eventFirstStart?: number;
    eventLastEnd?: number;

    aboveActivities: string[];
    belowActivities: string[];

    calculatedEstimatedTime?: number;
    calculatedTimeSpent?: number;
}