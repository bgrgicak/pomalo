import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useActivityStore } from "./activities";
import { getTimePassed, getLocalDate, getUtcTimestamp } from "@/helper/date";
import { newId } from "@/data/pouchdb";
import { addEventToActivity, updateEventInActivity } from "@/data/events";

interface TimerState {
    activity: Activity | undefined;
    time: string;
    loading: boolean;
}

export const useTimerStore = defineStore(
    "timer",
    () => {
        const state: Ref<TimerState> = ref({
            activity: undefined,
            time: '',
            loading: true,
        });

        const activityStore = useActivityStore();

        const active = computed((): boolean => undefined !== state.value.activity && '' !== state.value.time);

        const time = computed((): string => state.value.time);

        const isLoading = computed((): boolean => state.value.loading);

        const title = computed((): string => {
            if (!state.value.activity) {
                return '';
            }
            return state.value.activity.title;
        });

        const activityId = computed((): string | undefined => {
            if (!state.value.activity) {
                return undefined;
            }
            return state.value.activity._id;
        });


        const getCurrentActivity = (): Promise<void | Activity[]> => {
            const now = getUtcTimestamp();
            return activityStore.find({
                "selector": {
                    "eventFirstStart": {
                        "$lte": now
                    },
                    "eventLastEnd": {
                        "$exists": true
                    },
                    "timerRunning": true,
                },
            }).then((activities) => {
                if (activities && activities.length > 0) {
                    state.value.activity = activities[0];
                } else {
                    state.value.activity = undefined;
                }
            });
        };

        const calculateTime = (forceActivityCheck: boolean = false) => {
            // TODO reduce calls to getCurrentActivity
            if (forceActivityCheck || 0 === getLocalDate().getSeconds() % 10) {
                getCurrentActivity().then(() => {
                    state.value.loading = false;
                });
            }
            if (!state.value.activity) {
                return '';
            }
            const currentEvent = state.value.activity.events.find((event) => {
                return !event.end;
            });
            if (!currentEvent) {
                return '';
            }
            state.value.time = getTimePassed(currentEvent.start);
        };
        calculateTime(true);
        setInterval(calculateTime, 1000);

        const stop = () => {
            if (!state.value.activity) {
                return Promise.resolve();
            }
            return activityStore.get(state.value.activity._id).then((activity) => {
                const updatedActivity = activity as Activity;
                updatedActivity.events = updatedActivity.events.map((event) => {
                    if (event.end) {
                        return event;
                    }
                    event.end = getLocalDate();
                    return event;
                });
                return activityStore.updateFields(
                    updatedActivity._id,
                    {
                        'events': updatedActivity.events,
                        'timerRunning': false,
                    }
                ).then(() => {
                    state.value.activity = undefined;
                });
            });
        };
        const start = (activityId: string) => {
            stop().then(() => {
                activityStore.get(activityId).then((activity) => {
                    if (!activity) {
                        return;
                    }
                    const updatedActivity = addEventToActivity(
                        activity,
                        {
                            id: newId('activityEvent'),
                            start: getLocalDate(),
                        }
                    );
                    activityStore.updateFields(
                        updatedActivity._id,
                        {
                            'events': updatedActivity.events,
                            'timerRunning': true,
                        }
                    ).then(() => {
                        state.value.activity = updatedActivity;
                    });
                });
            });
        };

        return {
            state,
            active,
            time,
            isLoading,
            activityId,
            title,
            start,
            stop,
        };
    },
);
