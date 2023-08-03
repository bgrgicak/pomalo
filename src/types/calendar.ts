import type { ActivityEvent } from "./activity";

export interface CalendarEvent {
    id?: string;
    eventId: string;
    title?: string;
    start: Date;
    end: Date | undefined;
    repeatIteration?: boolean;
    allDay?: boolean;
    content?: string;
    class?: string;
    deletable?: boolean;
    resizable?: boolean;
    background?: boolean;
}

export interface CalendarState {
    events: CalendarEvent[];
    loading: boolean;
    focusedEvent?: CalendarEvent;
    startTime?: Date;
    endTime?: Date;
}