import type { ActivityEvent } from "@/types/activity";
import { defineStore } from "pinia";

export const useLayoutStore = defineStore(
    "layout",
    {
        state: () => {
            return {
                leftSidebarVisibility: false,
                rightSidebarVisibility: false,
                currentActivityId: undefined as string | undefined,
                currentEvent: undefined as ActivityEvent | undefined,
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
            showRightSidebar (activityId: string | undefined = undefined, event: ActivityEvent | undefined = undefined) {
                this.rightSidebarVisibility = true;
                if (activityId) {
                    this.currentActivityId = activityId;
                }
                if (event) {
                    this.currentEvent = event;
                }
            },
            hideRightSidebar () {
                this.rightSidebarVisibility = false;
                this.currentActivityId = undefined;
                this.currentEvent = undefined;
            }
        }
    },
);
