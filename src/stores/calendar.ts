import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { useActivityStore } from './activities';
import { parseEventsFromActivities } from '@/data/events';
import { getUtcTimestamp } from '@/helper/date';
import { useTimerStore } from './timer';
import type { CalendarState, CalendarEvent, CalendarClipboardType, CalendarClipboard } from '@/types/calendar';


export const useCalendarStore = defineStore(
	'calendar',
	() => {
		const state: Ref<CalendarState> = ref({
			activityIds: [],
			focusedEvent: undefined,
			focusedCell: undefined,
			loading: true,
			clipboard: undefined,
		});

		const activityStore = useActivityStore();
		const timerStore = useTimerStore();

		const isLoading = computed((): boolean => state.value.loading);
		const focusedEvent = computed((): CalendarEvent | undefined => state.value.focusedEvent);
		const clipboard = computed((): CalendarClipboard | undefined => state.value.clipboard);
		const focusedCell = computed((): Date | undefined => state.value.focusedCell);
		const events = computed((): CalendarEvent[] => {
			if (!state.value.startTime || !state.value.endTime) {
				return [];
			}
			return parseEventsFromActivities(
				activityStore.list.filter((activity) => {
					return state.value.activityIds.includes(activity._id as string);
				}),
				state.value.startTime,
				state.value.endTime,
				timerStore.activityId,
			);
		});

		const load = (start: Date, end: Date) => {
			state.value.startTime = start;
			state.value.endTime = end;
			return activityStore.find({
				'selector': {
					'eventFirstStart': {
						'$lte': getUtcTimestamp(state.value.endTime)
					},
					'eventLastEnd': {
						'$gte': getUtcTimestamp(state.value.startTime)
					},
				},
			}, true, true).then((activities) => {
				state.value.activityIds = activities ? activities.map((activity) => activity._id as string) : [];
				return state.value.activityIds;
			});
		};

		const focusEvent = (eventId: string) => {
			state.value.focusedEvent = events.value.find((event) => event.eventId === eventId);
		};

		const unfocusEvent = () => {
			state.value.focusedEvent = undefined;
		};

		const focusCell = (date: Date) => {
			state.value.focusedCell = date;
		};

		const unfocusCell = () => {
			state.value.focusedCell = undefined;
		};

		const addToClipboard = (activityId: string, eventId: string, type: CalendarClipboardType) => {
			state.value.clipboard = {
				activityId,
				eventId,
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
			focusedEvent,
			focusedCell,
			clipboard,
			load,
			focusEvent,
			unfocusEvent,
			focusCell,
			unfocusCell,
			addToClipboard,
			removeFromClipboard
		};
	}
);
