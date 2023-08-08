import type { ActivityEvent } from "@/types/activity";
import type { LayoutState } from "@/types/layout";
import { defineStore } from "pinia";
import { type Ref, computed, ref } from "vue";

export const useLayoutStore = defineStore(
    "layout",
    () => {
        const state: Ref<LayoutState> = ref({
            leftSidebarVisibility: false,
            rightSidebarVisibility: false,
            menuVisibility: undefined,
            current: {},
        });

        const isLeftSidebarVisible = computed(() => state.value.leftSidebarVisibility);
        const isRightSidebarVisible = computed(() => state.value.rightSidebarVisibility);
        const isMenuVisible = computed(() => state.value.menuVisibility);
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

        const updateMenuVisibility = (visible: boolean) => {
            state.value.menuVisibility = visible;
        };
        return {
            state,
            isLeftSidebarVisible,
            isRightSidebarVisible,
            isMenuVisible,
            currentActivityId,
            currentEvent,
            showLeftSidebar,
            hideLeftSidebar,
            showRightSidebar,
            hideRightSidebar,
            updateMenuVisibility,
        };
    }
);
