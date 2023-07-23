import type Activity from "@/types/activity";
import type { ActivityType } from "@/types/activity";
import Router from '@/router/router';

export const emptyActivity = (type: ActivityType): Activity => {
    return {
        title: '',
        type,
        created: new Date(),
    };
};

export const openActivityPage = async (activity: Activity) => {
    return Router.push(`/${activity.type}/${activity._id}/`);
};

export const updateCompletedDate = (activity: Activity): Activity => {
    const updateActivity = structuredClone(activity) as Activity;
    updateActivity.completedDate = updateActivity.completedDate ? undefined : new Date();
    return updateActivity;
};