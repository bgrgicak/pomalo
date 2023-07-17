import type Activity from "@/types/activity";
import { defineStore } from "pinia";

export const useLayoutStore = defineStore(
    "layout",
    {
        state: () => {
            return {
                leftSidebarVisibility: false,
                rightSidebarVisibility: false,
                currentActivity: undefined as Activity | undefined,
            };
        },
        getters: {
            isLeftSidebarVisible: (state) => state.leftSidebarVisibility,
            isRightSidebarVisible: (state) => state.rightSidebarVisibility && undefined !== state.currentActivity,
        },
        actions: {
            showLeftSidebar() {
                this.leftSidebarVisibility = true;
            },
            hideLeftSidebar() {
                this.leftSidebarVisibility = false;
            },
            showRightSidebar(activity?: Activity) {
                this.rightSidebarVisibility = true;
                if (activity) {
                    this.currentActivity = activity;
                }
            },
            hideRightSidebar() {
                this.rightSidebarVisibility = false;
                this.currentActivity = undefined;
            }
        }
    },
);
