import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useActivityStore } from "./activities";
import { getLocalDate, getUtcTimestamp } from "@/helper/date";
import type { ActivityEvent } from "@/types/activity";

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date | undefined;
    content: string;
    class: string;
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
                                events.push({
                                    id: activity._id,
                                    title: activity.title,
                                    start: getLocalDate(event.start),
                                    end: event.end ? getLocalDate(event.end) : getLocalDate(),
                                    content: '',
                                    class: 'calendar-event__' + activity.type,
                                    //   background: {Boolean} // Optional. (Event type not CSS property)
                                    //   split: {Number|String} // Optional.
                                    //   allDay: {Boolean} // Optional.
                                    //   deletable: false // optional - force undeletable when events are editable.
                                    //   resizable: false // optional - force unresizable when events are editable.
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
