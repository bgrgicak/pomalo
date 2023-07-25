import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useActivityStore } from "./activities";
import { getLocalDate } from "@/helper/date";
import type { ActivityEvent } from "@/types/activity";

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date | undefined;
}

interface CalendarState {
    events: CalendarEvent[];
    loading: boolean;
}

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

        const load = (start: Date, end: Date) => {
            activityStore.find({
                selector: {
                    events: {
                        $elemMatch: {
                            start: {
                                $gte: start.getTime(),
                                $lte: end.getTime(),
                            },
                        },
                    },
                },
            }).then((activities) => {
                const events: CalendarEvent[] = [];
                if (activities) {
                    activities.forEach((activity: Activity) => {
                        activity.events
                            .filter((event: ActivityEvent) => {
                                return event.start >= start.getTime() && event.start <= end.getTime();
                            })
                            .forEach((event) => {
                                events.push({
                                    id: activity._id,
                                    title: activity.title,
                                    start: getLocalDate(event.start),
                                    end: event.end ? getLocalDate(event.end) : getLocalDate(),
                                });
                            });
                    });
                }
                state.value.events = events;
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
