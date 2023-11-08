import __ from '@/helper/translations';
import { useProjectStore } from '@/stores/projects';
import type Activity from '@/types/activity';
import { ActivityFilterGroup, ActivityFilterSort, ActivityFilterStatus, type ActivityFilterState, type ActivityGroup } from '@/types/activity-filter';

export const filterActivityList = (activities: Activity[], filters: ActivityFilterState): Activity[] => {
	let filteredActivities = [...activities];

	filteredActivities = filteredActivities.filter(
		(activity) => {
			if ( filters.status === ActivityFilterStatus.Completed ) {
				return activity.completedDate !== undefined;
			} else if ( filters.status === undefined || filters.status === ActivityFilterStatus.NotCompleted ) {
				return activity.completedDate === undefined;
			}
			return true;
		}
	);

	if (filters.project) {
		filteredActivities = filteredActivities.filter((activity) => activity.parent === filters.project);
	}

	return filteredActivities;
};

export const sortActivityGroups = (activityGroups: ActivityGroup[]): ActivityGroup[] => {
	return activityGroups.sort((a: ActivityGroup, b: ActivityGroup) => {
		return a.name.localeCompare(b.name);
	});
};

export const sortActivities = (activityGroups: ActivityGroup[], filters: ActivityFilterState): ActivityGroup[] => {
	return activityGroups.map((group: ActivityGroup) => {
		group.activities = group.activities.sort(
			(a: Activity, b: Activity) => {
				if (filters.sort === ActivityFilterSort.Created) {
					return a.created > b.created ? -1 : 1;
				} else if (filters.sort === ActivityFilterSort.DueDate) {
					if (!a.dueDate) {
						return -1;
					} else if (!b.dueDate) {
						return 1;
					}
					return a.dueDate > b.dueDate ? 1 : -1;
				} else if (filters.sort === ActivityFilterSort.Name) {
					return a.title.localeCompare(b.title);
				}
				return 0;
			}
		);
		return group;
	});
};

export const groupActivities = (activities: Activity[], filters: ActivityFilterState): ActivityGroup[] => {
	const projectStore = useProjectStore();

	const groups: {[key: string]: ActivityGroup} = {
		other: {
			name: __('Other'),
			activities: [] as Activity[],
		},
		inProgress: {
			name: __('In progress'),
			activities: [] as Activity[],
		},
		notStarted: {
			name: __('Not started'),
			activities: [] as Activity[],
		},
		completed: {
			name: __('Completed'),
			activities: [] as Activity[],
		},
		noProject: {
			name: __('No project'),
			activities: [] as Activity[],
		},
	};

	if (!filters.group) {
		groups.other.activities = activities;
	} else {
		activities.forEach((activity: Activity) => {
			if (filters.group === ActivityFilterGroup.Completed) {
				if (activity.completedDate) {
					groups.completed.activities.push(activity);
				} else if ( activity.events && activity.events.length > 0) {
					groups.inProgress.activities.push(activity);
				} else {
					groups.notStarted.activities.push(activity);
				}
			} else if (filters.group === ActivityFilterGroup.Project) {
				if (activity.parent) {
					if (!groups[activity.parent]) {
						groups[activity.parent] = {
							name: projectStore.getTitle(activity.parent),
							activityId: activity.parent,
							activities: [],
						};
					}
					groups[activity.parent].activities.push(activity);
				} else {
					groups.noProject.activities.push(activity);
				}
			}
		});
	}
	return Object.values(groups)
		.filter(
			(group: ActivityGroup) => group.activities.length > 0
		);
};