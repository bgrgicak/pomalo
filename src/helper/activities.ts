import type Activity from "@/types/activity";
import type { ActivityType } from "@/types/activity";
import Router from '@/router/router';
import { getUtcTimestamp } from "./date";

export const newActivityId = (type: string): string => {
    return [
        type,
        0, // if user isn't logged in, use 0
        getUtcTimestamp() + Math.random(),
    ].join('');
};

export const emptyActivity = (type: ActivityType): Activity => {
    return {
        _id: newActivityId(type),
        title: '',
        description: '',
        type,
        created: getUtcTimestamp(),
        members: [],
        events: [],
    };
};

export const addDefaultsToActivity = (activity: Activity): Activity => {
    return {
        ...emptyActivity(activity.type),
        ...activity,
    };
};

export const openActivityPage = async (activity: Activity) => {
    return Router.push(`/${activity.type}/${activity._id}/`);
};