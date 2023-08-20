import type Activity from '@/types/activity';
import { defineStore } from 'pinia';
import { computed, ref, watch, type Ref } from 'vue';
import { useActivityStore, type ActivityMap } from './activities';
import { parseEventsFromActivities } from '@/data/events';
import { getUtcTimestamp } from '@/helper/date';
import { useTimerStore } from './timer';
import type { CalendarState, CalendarEvent, CalendarClipboardType, CalendarClipboard } from '@/types/calendar';
import { display } from '@/plugins/vuetify';


export const useCalendarStore = defineStore(
	'calendar',
	() => {
		const state: Ref<CalendarState> = ref({
			events: [],
			focusedEvent: undefined,
			focusedCell: undefined,
			loading: true,
			clipboard: undefined,
		});

		const activityStore = useActivityStore();
		const timerStore = useTimerStore();

		const isLoading = computed((): boolean => state.value.loading);
		const events = computed((): CalendarEvent[] => state.value.events);
		const focusedEvent = computed((): CalendarEvent | undefined => state.value.focusedEvent);
		const clipboard = computed((): CalendarClipboard | undefined => state.value.clipboard);
		const focusedCell = computed((): Date | undefined => state.value.focusedCell);
		const small = computed((): boolean => display.value.smAndDown.value);
		const mobile = computed((): boolean => display.value.mobile.value);


		watch(() => activityStore.activities, (updatedActivities: ActivityMap) => {
			if (!state.value.startTime || !state.value.endTime) {
				return;
			}
			state.value.events = parseEventsFromActivities(
                Object.values(updatedActivities) as Activity[],
                state.value.startTime,
                state.value.endTime,
                timerStore.activityId,
			);
		}, { deep: true });

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
			}).then((activities) => {
				if (!state.value.startTime || !state.value.endTime) {
					return [];
				}
				state.value.events = parseEventsFromActivities(
                    activities as Activity[],
                    state.value.startTime,
                    state.value.endTime,
                    timerStore.activityId,
				);
				return events;
			});
		};

		const focusEvent = (eventId: string) => {
			state.value.focusedEvent = state.value.events.find((event) => event.eventId === eventId);
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
			small,
			mobile,
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
