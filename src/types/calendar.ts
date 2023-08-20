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
    activityIds: string[];
    loading: boolean;
    focusedEvent?: CalendarEvent;
    focusedCell?: Date;
    startTime?: Date;
    endTime?: Date;
    clipboard?: CalendarClipboard;
}

export enum CalendarClipboardType {
    Copy = 'copy',
    Cut = 'cut',
}


export interface CalendarClipboard {
    activityId: string;
    eventId: string;
    type: CalendarClipboardType;
}