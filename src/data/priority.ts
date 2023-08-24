import { dayInMilliseconds, getUtcTimestamp } from '@/helper/date';
import { warning } from '@/helper/logs';
import { settings } from '@/helper/settings';
import type Activity from '@/types/activity';


const multiplyEstimate = (estimatedHours: number): number => {
	return estimatedHours * settings.estimateMultiplier;
};

const getEstimateBucket = (estimatedHours: number): number => {
	if (estimatedHours <= 1) {
		return 1;
	} else if (estimatedHours <= 3) {
		return 3;
	} else if (estimatedHours <= 5) {
		return 5;
	} else if (estimatedHours <= 8) {
		return 8;
	} else if (estimatedHours <= 16) {
		return 16;
	} else if (estimatedHours <= 32) {
		return 32;
	} else {
		return estimatedHours;
	}
};

/**
 * Get the estimated time in milliseconds multiplied by the estimate factor.
 * If no time is set it will return the default time of one day.
 * @param activity
 * @returns estimated time in milliseconds
 */
export const getEstimatedHours = (activity: Activity): number => {
	if (!activity.estimatedHours) {
		return dayInMilliseconds;
	}
	return multiplyEstimate(
		(
			getEstimateBucket(
				activity.estimatedHours
			) / settings.workingHoursPerDay
		) * dayInMilliseconds
	);
};

export const getWorkedTime = (activity: Activity): number => {
	if (!activity.events.length) {
		return 0;
	}
	return activity.events.reduce((total, event) => {
		if (!event.end) {
			return total;
		}
		if (event.start > event.end) {
			warning('Event start is after end for activity ' + activity.title, event);
		}
		return total + (
			getUtcTimestamp(event.end) - getUtcTimestamp(event.start)
		);
	}, 0);
};