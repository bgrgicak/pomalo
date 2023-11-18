import type { ActivityEvent } from './activity';
import type Activity from './activity';

export interface ActivityDocumentEvent extends Omit<ActivityEvent, 'start' | 'end' | 'repeatEnd' | 'recurrenceId'> {
    start: number;
    end?: number;
    repeatEnd?: number;
    recurrenceId?: number;
}
export interface ActivityDocument extends Omit<Activity, 'created' | 'events' | 'completedDate' | 'startDate' | 'dueDate' | 'eventFirstStart' | 'eventLastEnd' | 'archived'> {
    created: number;
    events: ActivityDocumentEvent[];

    completedDate?: number;
    startDate?: number;
    dueDate?: number;

    eventFirstStart?: number;
    eventLastEnd?: number;

    archived?: number;
}