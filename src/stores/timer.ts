import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useActivityStore } from "./activities";
import { getTimePassed, getUtcTimestamp } from "@/helper/date";

interface TimerState {
    activity: Activity | undefined;
    time: string;
}

export const useTimerStore = defineStore(
    "timer",
    () => {
        const state: Ref<TimerState> = ref({
            activity: undefined,
            time: "00:00:00",
        });

        const activityStore = useActivityStore();

        const active = computed((): boolean => undefined !== state.value.activity);

        const time = computed((): string => state.value.time);

        // TODO destroy
        setInterval(() => {
            if (!state.value.activity) {
                return "00:00:00";
            }
            const currentEvent = state.value.activity.events.find((event) => {
                return !event.end;
            });
            console.log(currentEvent);
            if (!currentEvent) {
                return "00:00:00";
            }
            state.value.time = getTimePassed(currentEvent.start);
        }, 1000);

        const start = (activityId: string) => {
            activityStore.get(activityId).then((activity) => {
                const updatedActivity = activity as Activity;
                updatedActivity.events.push({
                    start: getUtcTimestamp(),
                });
                activityStore.update(updatedActivity).then(() => {
                    if (activity) {
                        state.value.activity = activity;
                    }
                });
            });
        };
        const stop = () => {
            console.log(state.value.activity);
            if (!state.value.activity) {
                return;
            }
            activityStore.get(state.value.activity._id).then((activity) => {
                const updatedActivity = activity as Activity;
                updatedActivity.events = updatedActivity.events.map((event) => {
                    if (event.end) {
                        return event;
                    }
                    event.end = getUtcTimestamp();
                    return event;
                });
                activityStore.update(updatedActivity).then(() => {
                    state.value.activity = undefined;
                });
            });
        };

        const getCurrent = (): Promise<void | Activity[]> => {
            const query = {
                selector: {
                    events: {
                        $elemMatch: {
                            start: {
                                $lte: getUtcTimestamp(),
                            },
                            end: {
                                $exists: false,
                            },
                        }
                    }
                },
                // use_index : "events-index",
            };
            console.log(query);
            return activityStore.find(query).then((activities) => {
                console.log(activities);
                if (activities && activities.length > 0) {
                    state.value.activity = activities[0];
                }
            });
        };

        return {
            state,
            active,
            time,
            start,
            stop,
            getCurrent,
        };
    },
);
