import type Activity from "@/types/activity";
import type Notice from "@/types/notice";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

interface TimerState {
    activityId: string | undefined;
}

// TODO Show notices in the UI
export const useNoticeStore = defineStore(
    "notices",
    () => {
        const state: Ref<TimerState> = ref({
            activityId: undefined,
        });
        return {
            state,
            active: () => undefined !== state.value.activityId,
            start: (activityId: string) => {
                state.value.activityId = activityId;
            },
            stop: () => {
                state.value.activityId = undefined;
            }
        };
    },
);
