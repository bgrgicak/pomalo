import type { ActivityEvent } from "./activity";

export interface LayoutState {
    leftSidebarVisibility: boolean;
    rightSidebarVisibility: boolean;
    menuVisibility?: boolean;
    current: {
        activityId?: string;
        event?: ActivityEvent;
    };
}
