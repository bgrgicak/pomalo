import type { ActivityType } from './activity';

export interface CalendarEvent {
	id?: string;
	eventId: string;
	title?: string;
	start: Date;
	end: Date | undefined;
	type?: ActivityType;
	repeatIteration?: boolean;
	allDay?: boolean;
	content?: string;
	class?: string;
	deletable?: boolean;
	resizable?: boolean;
	background?: boolean;
	recurrenceId?: Date;
	new?: boolean;
}

export interface CalendarState {
	activityIds: string[];
	loading: boolean;
	focusedEvents: CalendarEvent[];
	focusedCell?: Date;
	startTime?: Date;
	endTime?: Date;
	clipboard?: CalendarClipboard;
	newEvent?: CalendarEvent;
}

export enum CalendarClipboardType {
	Copy = 'copy',
	Cut = 'cut',
}

export interface CalendarClipboard {
	events: CalendarEvent[];
	type: CalendarClipboardType;
}