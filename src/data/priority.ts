import { dayInMilliseconds, getLocalDate, getUtcTimestamp, yearInMilliseconds } from "@/helper/date";
import { debug, warning } from "@/helper/logs";
import { settings } from "@/helper/settings";
import { useActivityStore } from "@/stores/activities";
import type Activity from "@/types/activity";
import { ActivityType } from "@/types/activity";

/**
 * Get the number of milliseconds left until due date
 * @param activity 
 * @returns number of milliseconds left until due date
 */
const getTimeLeftUntilDueDate = (activity: Activity): number => {
    if (!activity.dueDate) {
        return yearInMilliseconds;
    }
    const currentTimestamp = getUtcTimestamp();
    const dueDate = getUtcTimestamp(activity.dueDate);
    return dueDate - currentTimestamp;
};

const getPercentageOfUsedTime = (activity: Activity, estimatedTime: number, workedTime: number): number => {
    const timeLeftUntilDueDate: number = getTimeLeftUntilDueDate(activity);
    return 100 - (
        (
            timeLeftUntilDueDate - estimatedTime + workedTime
        ) / timeLeftUntilDueDate
    ) * 100;
};


const multiplyEstimate = (estimatedTime: number): number => {
    return estimatedTime * settings.estimateMultiplier;
};

const getEstimateBucket = (estimatedTime: number): number => {
    if (estimatedTime <= 1) {
        return 1;
    } else if (estimatedTime <= 3) {
        return 3;
    } else if (estimatedTime <= 5) {
        return 5;
    } else if (estimatedTime <= 8) {
        return 8;
    } else if (estimatedTime <= 16) {
        return 16;
    } else if (estimatedTime <= 32) {
        return 32;
    } else {
        return estimatedTime;
    }
};

/**
 * Get the estimated time in milliseconds multiplied by the estimate factor.
 * If no time is set it will return the default time of one day.
 * @param activity
 * @returns estimated time in milliseconds
 */
const getEstimatedTime = (activity: Activity): number => {
    if (!activity.estimatedTime) {
        return dayInMilliseconds;
    }
    return multiplyEstimate(
        (
            getEstimateBucket(
                activity.estimatedTime
            ) / settings.workingHoursPerDay
        ) * dayInMilliseconds
    );
};

const getWorkedTime = (activity: Activity): number => {
    if (!activity.events.length) {
        return 0;
    }
    return activity.events.reduce((total, event) => {
        const end = event.end ?? getLocalDate();
        if (event.start > end) {
            warning('Event start is after end for activity ' + activity.title, event);
        }
        return total + (
            getUtcTimestamp(end) - getUtcTimestamp(event.start)
        );
    }, 0);
};

const getCompletePercentage = (estimatedTime: number, workedTime: number): number => {
    return (
        workedTime / estimatedTime
    ) * 100;
};


export const calculateActivityPriority = (activity: Activity): number => {
    const estimatedTime: number = getEstimatedTime(activity);
    const workedTime = getWorkedTime(activity);

    // Is current task
    const isCurrentTask: number = !!activity.timerRunning ? 100 : 0;
    // Is completed
    const notCompleted: number = undefined === activity.completedDate ? 100 : 0;
    // Is in progress
    const isInProgress: number = 0 < activity.events.length ? 100 : 0;
    // Percentage of available time task will require to complete
    const percentageOfUsedTime: number = getPercentageOfUsedTime(activity, estimatedTime, workedTime);
    // Estimated complete percentage
    const completePercentage: number = getCompletePercentage(estimatedTime, workedTime);

    debug(
        activity.title,
        {
            isCurrentTask,
            notCompleted,
            isInProgress,
            percentageOfUsedTime,
            completePercentage,
            workedTime,
            estimatedTime,
        }
    );
    return [
        isCurrentTask * 10,
        notCompleted * 10,
        isInProgress * 5,
        percentageOfUsedTime * 5,
        completePercentage * 5,
    ].reduce((total, value) => total + value, 0);
};

export const recalculateAllPriorities = () => {
    const activityStore = useActivityStore();
    activityStore.find(
        {
            selector: {
                type: ActivityType.Task
            },
        }
    ).then((activities) => {
        if (!activities) {
            return;
        }
        activities.forEach((activity) => {
            activityStore.updateField(
                activity._id,
                'priority',
                calculateActivityPriority(activity)
            );
        });
    });
};