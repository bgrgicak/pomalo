import type { ActivityEvent } from "./activity";

export interface LayoutState {
    leftSidebarVisibility: boolean;
    rightSidebarVisibility: boolean;
    current: {
        activityId?: string;
        event?: ActivityEvent;
    };
}
