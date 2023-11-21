import type { ActivityEvent } from './activity';
import type Activity from './activity';

export interface ActivityDocumentEvent extends Omit<ActivityEvent, 'start' | 'end' | 'repeatEnd' | 'recurrenceId' | 'exceptionDates' | 'additionalDates'> {
    start: number;
    end?: number;
    repeatEnd?: number;
    recurrenceId?: number;
    exceptionDates?: number[];
    additionalDates?: number[];
}
export interface ActivityDocument extends Omit<Activity, 'created' | 'updated' | 'events' | 'completedDate' | 'startDate' | 'dueDate' | 'eventFirstStart' | 'eventLastEnd' | 'archived'> {
    created: number;
    updated?: number;
    events: ActivityDocumentEvent[];

    completedDate?: number;
    startDate?: number;
    dueDate?: number;

    eventFirstStart?: number;
    eventLastEnd?: number;

    archived?: number;
}