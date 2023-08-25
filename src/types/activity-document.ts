import type { ActivityEvent } from './activity';
import type Activity from './activity';

export interface ActivityDocumentEvent extends Omit<ActivityEvent, 'start' | 'end' | 'repeatEnd'> {
    start: number;
    end?: number;
    repeatEnd?: number;
}
export interface ActivityDocument extends Omit<Activity, 'created' | 'events' | 'completedDate' | 'startDate' | 'dueDate' | 'eventFirstStart' | 'eventLastEnd'> {
    created: number;
    events: ActivityDocumentEvent[];

    completedDate?: number;
    startDate?: number;
    dueDate?: number;

    eventFirstStart?: number;
    eventLastEnd?: number;
}