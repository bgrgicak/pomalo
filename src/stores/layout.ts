import Activity, { ActivityEvent } from "@/types/activity";
import { LayoutState } from "@/types/layout";
import { defineStore } from "pinia";
import { Ref, computed, ref } from "vue";

export const useLayoutStore = defineStore(
    "layout",
    () => {
        const state: Ref<LayoutState> = ref({
            leftSidebarVisibility: false,
            rightSidebarVisibility: false,
            current: {},

        });

        const isLeftSidebarVisible = computed(() => state.value.leftSidebarVisibility);
        const isRightSidebarVisible = computed(() => state.value.rightSidebarVisibility);
        const currentActivityId = computed(() => state.value.current.activityId);
        const currentEvent = computed(() => state.value.current.event);

        const showLeftSidebar = () => {
            state.value.leftSidebarVisibility = true;
        };
        const hideLeftSidebar = () => {
            state.value.leftSidebarVisibility = false;
        };
        const showRightSidebar = (activityId: string | undefined = undefined, event: ActivityEvent | undefined = undefined) => {
            state.value.rightSidebarVisibility = true;
            state.value.current = {
                activityId,
                event,
            };
        };
        const hideRightSidebar = () => {
            state.value.rightSidebarVisibility = false;
            state.value.current = {};
        };
        return {
            state,
            isLeftSidebarVisible,
            isRightSidebarVisible,
            currentActivityId,
            currentEvent,
            showLeftSidebar,
            hideLeftSidebar,
            showRightSidebar,
            hideRightSidebar,
        };
    }
);
