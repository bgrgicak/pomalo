import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useLayoutStore = defineStore(
    "layout",
    () => {
        const state = ref({
            leftSidebarVisibility: false,
            rightSidebarVisibility: false,
            currentActivityId: undefined as string | undefined,
        });

        const isLeftSidebarVisible = computed(() => state.value.leftSidebarVisibility);
        const isRightSidebarVisible = computed(() => state.value.rightSidebarVisibility);
        const currentActivityId = computed(() => state.value.currentActivityId);

        const showLeftSidebar = () => {
            state.value.leftSidebarVisibility = true;
        };
        const hideLeftSidebar = () => {
            state.value.leftSidebarVisibility = false;
        };
        const showRightSidebar = (activityId: string | undefined = undefined) => {
            state.value.rightSidebarVisibility = true;
            if (activityId) {
                state.value.currentActivityId = activityId;
            }
        };
        const hideRightSidebar = () => {
            state.value.rightSidebarVisibility = false;
            state.value.currentActivityId = undefined;
        };
        return {
            state,
            isLeftSidebarVisible,
            isRightSidebarVisible,
            currentActivityId,
            showLeftSidebar,
            hideLeftSidebar,
            showRightSidebar,
            hideRightSidebar,
        };
    }
);
