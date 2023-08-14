import type { ActivityEvent, ActivityType } from "./activity";

export interface LayoutState {
    leftSidebarVisibility: boolean;
    rightSidebarVisibility: boolean;
    menuVisibility?: boolean;
    current: {
        activityId?: string;
        event?: ActivityEvent;
        type?: ActivityType;
    };
}
