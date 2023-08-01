import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, watch, type Ref } from "vue";
import { useActivityStore, type ActivityMap } from "./activities";
import type { CalendarEvent, CalendarState } from "@/types/calendar";
import { parseEventsFromActivities } from "@/data/events";
import { getUtcTimestamp } from "@/helper/date";
import { useTimerStore } from "./timer";


export const useCalendarStore = defineStore(
    "calendar",
    () => {
        const state: Ref<CalendarState> = ref({
            events: [],
            loading: true,
        });

        const activityStore = useActivityStore();
        const timerStore = useTimerStore();

        const isLoading = computed((): boolean => state.value.loading);

        const events = computed((): CalendarEvent[] => state.value.events);


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
                "selector": {
                    "eventFirstStart": {
                        "$lte": getUtcTimestamp(state.value.endTime)
                    },
                    "eventLastEnd": {
                        "$gte": getUtcTimestamp(state.value.startTime)
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

        return {
            state,
            isLoading,
            events,
            load,
        };
    }
);
