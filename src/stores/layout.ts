import { defineStore } from "pinia";

export const useLayoutStore = defineStore(
    "layout",
    {
        state: () => {
            return {
                leftSidebarVisibility: false,
                rightSidebarVisibility: false,
                currentActivityId: undefined as string | undefined,
            };
        },
        getters: {
            isLeftSidebarVisible: (state) => state.leftSidebarVisibility,
            isRightSidebarVisible: (state) => state.rightSidebarVisibility,
        },
        actions: {
            showLeftSidebar () {
                this.leftSidebarVisibility = true;
            },
            hideLeftSidebar () {
                this.leftSidebarVisibility = false;
            },
            showRightSidebar (activityId: string | undefined = undefined) {
                this.rightSidebarVisibility = true;
                if (activityId) {
                    this.currentActivityId = activityId;
                }
            },
            hideRightSidebar () {
                this.rightSidebarVisibility = false;
                this.currentActivityId = undefined;
            }
        }
    },
);
