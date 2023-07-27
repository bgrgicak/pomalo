import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, watch, type Ref } from "vue";
import { useActivityStore, type ActivityMap } from "./activities";
import { getLocalDate, getUtcTimestamp } from "@/helper/date";
import type { ActivityEvent } from "@/types/activity";

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
    startTime?: number;
    endTime?: number;
}

const parseEventsFromActivities = (activities: Activity[], startTime: number, endTime: number, currentActivityId?: string): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    if (activities) {
        activities.forEach((activity: Activity) => {
            activity.events
                .filter((event: ActivityEvent) => {
                    return event.start >= startTime && event.start <= endTime;
                })
                .forEach((event) => {
                    const isCurrentActivity = currentActivityId === activity._id;
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
    }
    return events;
};

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
                selector: {
                    events: {
                        $elemMatch: {
                            start: {
                                $gte: state.value.startTime,
                                $lte: state.value.endTime,
                            },
                        },
                    },
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
