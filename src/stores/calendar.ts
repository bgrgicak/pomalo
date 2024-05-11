import { parseEventsFromActivities } from '@/data/events';
import { getUtcTimestamp } from '@/helper/date';
import type { CalendarClipboard, CalendarClipboardType, CalendarEvent, CalendarState } from '@/types/calendar';
import { defineStore } from 'pinia';
import { computed, ref, watch, type Ref } from 'vue';
import { useActivityStore } from './activities';
import { useTimerStore } from './timer';
import database from '@/data/pouchdb';
import log from '@/helper/logs';
import type { ActivityDocument } from '@/types/activity-document';
import { parseDocumentToActivity } from '@/data/activities';
import type Activity from '../types/activity';

export const useCalendarStore = defineStore('calendar', () => {
	const state: Ref<CalendarState> = ref({
		activityIds: [],
		focusedEvents: [],
		focusedCell: undefined,
		loading: true,
		clipboard: undefined,
	});

	const activityStore = useActivityStore();
	const timerStore = useTimerStore();

	const maybeUpdateActivity = (activity: Activity) => {
		if (!state.value.startTime || !state.value.endTime) {
			return;
		}
		if (
			(activity.eventFirstStart &&
				activity.eventFirstStart <= state.value.endTime) ||
			(activity.eventLastEnd &&
				activity.eventLastEnd >= state.value.startTime)
		) {
			addActivityId(activity._id);
		} else if (state.value.activityIds.includes(activity._id as string)) {
			removeActivityId(activity._id as string);
		}
	};

	watch(
		() => activityStore.list,
		() => {
			if (!state.value.startTime || !state.value.endTime) {
				return;
			}
			activityStore.list.forEach((activity) => {
				maybeUpdateActivity(activity);
			});
		}
	);

	const isLoading = computed((): boolean => state.value.loading);
	const newEvent = computed(
		(): CalendarEvent | undefined => state.value.newEvent
	);
	const hasNewEvent = computed((): boolean => !!state.value.newEvent);
	const focusedEvents = computed(
		(): CalendarEvent[] => state.value.focusedEvents
	);
	const clipboard = computed(
		(): CalendarClipboard | undefined => state.value.clipboard
	);
	const focusedCell = computed(
		(): Date | undefined => state.value.focusedCell
	);
	const events = computed((): CalendarEvent[] => {
		if (!state.value.startTime || !state.value.endTime) {
			return [];
		}
		const events = parseEventsFromActivities(
			activityStore.list.filter((activity) => {
				return state.value.activityIds.includes(activity._id as string);
			}),
			state.value.startTime,
			state.value.endTime,
			timerStore.activityId,
			state.value.focusedEvents.map((event) => event.eventId)
		);
		if (state.value.newEvent) {
			events.push(state.value.newEvent);
		}
		return events;
	});

	const load = (start: Date, end: Date) => {
		state.value.startTime = start;
		state.value.endTime = end;
		return activityStore
			.find({
				selector: {
					eventFirstStart: {
						$lte: getUtcTimestamp(state.value.endTime),
					},
					eventLastEnd: {
						$gte: getUtcTimestamp(state.value.startTime),
					},
				},
			})
			.then((activities) => {
				state.value.activityIds = activities
					? activities.map((activity) => activity._id as string)
					: [];
				return state.value.activityIds;
			});
	};

	const addActivityId = (activityId: string) => {
		if (!state.value.activityIds.includes(activityId)) {
			state.value.activityIds.push(activityId);
		}
	};

	const removeActivityId = (activityId: string) => {
		state.value.activityIds = state.value.activityIds.filter(
			(id) => id !== activityId
		);
	};

	const addNewEvent = (event: CalendarEvent) => {
		state.value.newEvent = event;
		if (event.id) {
			addActivityId(event.id);
		}
	};

	const removeNewEvent = () => {
		state.value.newEvent = undefined;
	};

	const focusEvent = (eventId: string) => {
		state.value.focusedEvents = [
			...state.value.focusedEvents,
			events.value.find(
				(event) => event.eventId === eventId
			) as CalendarEvent,
		];
	};

	const unfocusEvent = (eventId: string) => {
		state.value.focusedEvents = state.value.focusedEvents.filter(
			(event) => event.eventId !== eventId
		);
	};

	const toggleFocusEvent = (eventId: string) => {
		if (
			state.value.focusedEvents.find((event) => event.eventId === eventId)
		) {
			unfocusEvent(eventId);
		} else {
			focusEvent(eventId);
		}
	};

	const unfocusAllEvents = () => {
		state.value.focusedEvents = [];
	};

	const focusCell = (date: Date) => {
		state.value.focusedCell = date;
	};

	const unfocusCell = () => {
		state.value.focusedCell = undefined;
	};

	const addToClipboard = (
		events: CalendarEvent[],
		type: CalendarClipboardType
	) => {
		state.value.clipboard = {
			events,
			type,
		};
	};

	const removeFromClipboard = () => {
		state.value.clipboard = undefined;
	};

	return {
		state,
		isLoading,
		events,
		focusedEvents,
		focusedCell,
		clipboard,
		load,
		newEvent,
		hasNewEvent,
		addActivityId,
		addNewEvent,
		removeNewEvent,
		focusEvent,
		unfocusEvent,
		unfocusAllEvents,
		toggleFocusEvent,
		focusCell,
		unfocusCell,
		addToClipboard,
		removeFromClipboard,
	};
});
