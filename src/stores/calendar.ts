import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, watch, type Ref } from "vue";
import { useActivityStore, type ActivityMap } from "./activities";
import { getUtcTimestamp } from "@/helper/date";
import type { CalendarEvent, CalendarState } from "@/types/calendar";
import { parseEventsFromActivities } from "@/data/activities";


export const useCalendarStore = defineStore(
    "calendar",
    () => {
        const state: Ref<CalendarState> = ref({
            events: [],
            loading: true,
        });

        const activityStore = useActivityStore();

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
            );
        }, { deep: true });

        const load = (start: Date, end: Date) => {
            state.value.startTime = getUtcTimestamp(start);
            state.value.endTime = getUtcTimestamp(end);
            return activityStore.find({
                "selector": {
                    "events": {
                        "$elemMatch": {
                            "$or": [
                                {
                                    "start": {
                                        "$gte": state.value.startTime
                                    },
                                    "end": {
                                        "$exists": false
                                    }
                                },
                                {
                                    "start": {
                                        "$lte": state.value.endTime
                                    },
                                    "end": {
                                        "$gte": state.value.startTime
                                    },
                                },
                                {
                                    "start": {
                                        "$lte": state.value.endTime
                                    },
                                    "repeat": {
                                        "$exists": true
                                    },
                                    "repeatEnd": {
                                        "$gte": state.value.startTime
                                    },
                                },
                                {
                                    "start": {
                                        "$lte": state.value.endTime
                                    },
                                    "repeat": {
                                        "$exists": true
                                    },
                                    "repeatEnd": {
                                        "$exists": false
                                    },
                                },
                            ]
                        }
                    }
                },
            }).then((activities) => {
                if (!state.value.startTime || !state.value.endTime) {
                    return [];
                }
                state.value.events = parseEventsFromActivities(activities as Activity[], state.value.startTime, state.value.endTime);
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
