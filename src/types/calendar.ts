export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date | undefined;
    allDay: boolean;
    content: string;
    class: string;
    deletable: boolean;
    resizable: boolean;
    background: boolean;
}

export interface CalendarState {
    events: CalendarEvent[];
    loading: boolean;
    startTime?: Date;
    endTime?: Date;
}