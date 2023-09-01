import type { ActivityEvent, ActivityType } from './activity';

export interface LayoutState {
    leftSidebarVisibility: boolean;
    menuVisibility?: boolean;
    current: {
        event?: ActivityEvent;
        type?: ActivityType;
    };
}
