import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useActivityStore } from "./activities";
import { getLocalDate, getUtcTimestamp } from "@/helper/date";
import type { ActivityEvent } from "@/types/activity";
import { useTimerStore } from "./timer";
import { getActivityTypeColor } from "@/helper/activities";

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date | undefined;
    content: string;
    class: string;
    deletable: boolean;
    resizable: boolean;
    background: boolean;
}

export interface CalendarState {
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
        const timerStore = useTimerStore();

        const isLoading = computed((): boolean => state.value.loading);

        const events = computed((): CalendarEvent[] => state.value.events);

        const load = (start: Date, end: Date) => {
            const startTime = getUtcTimestamp(start);
            const endTime = getUtcTimestamp(end);
            return activityStore.find({
                selector: {
                    events: {
                        $elemMatch: {
                            start: {
                                $gte: startTime,
                                $lte: endTime,
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
                                return event.start >= startTime && event.start <= endTime;
                            })
                            .forEach((event) => {
                                const isCurrentActivity = timerStore.activityId === activity._id;
                                events.push({
                                    id: activity._id,
                                    title: activity.title,
                                    start: getLocalDate(event.start),
                                    end: event.end ? getLocalDate(event.end) : getLocalDate(),
                                    content: '',
                                    class: 'calendar-event__' + activity.type,
                                    deletable: isCurrentActivity,
                                    resizable: isCurrentActivity,
                                    background: isCurrentActivity,
                                });
                            });
                    });
                    state.value.events = events;
                    return events;
                }
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
