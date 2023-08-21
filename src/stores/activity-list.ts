import { defineStore } from 'pinia';
import type Activity from '@/types/activity';
import { computed, ref, type Ref } from 'vue';
import { useActivityStore } from './activities';
import { ActivityType } from '@/types/activity';

interface ActivityListStore {
	[key: string]: string[];
}

interface ActivityList {
	[key: string]: Activity[];
}

export const useActivityListStore = defineStore(
	'activity-list',
	() => {
		const activityLists: Ref<ActivityListStore> = ref({});

		const activityStore = useActivityStore();

		const list = computed((): ActivityList => {
			const list: any = {};
			Object.keys(activityLists.value).forEach((key) => {
				list[key] = activityStore.list.filter((activity) => {
					return activityLists.value[key].includes(activity._id as string)
						&& !activity.removed;
				});
			});
			return list;
		});

		const activitiesToIds = (activities: Activity[], parent?: string): string[] => {
			return activities.filter((activity: Activity) => {
				if (parent) {
					return activity.parent === parent;
				}
				return true !== activity.removed;
			}).map((activity: Activity) => activity._id);
		};

		const getListId = (type: ActivityType, parent?: string): string => {
			return btoa(`${type}-${parent}`);
		};

		const getTasks = (parent?: string): Promise<string[]> => {
			return activityStore.query(
				'priority/type',
				{
					endkey: ['task'],
					startkey: ['task', {}],
					include_docs: true,
					descending: true
				}
			).then((response: any) => {
				return activitiesToIds(response, parent);
			});
		};

		const getActivities = (type: ActivityType, parent?: string): Promise<string[]> => {
			return activityStore.find({
				selector: {
					type: type
				}
			}).then((response: any) => {
				return activitiesToIds(response, parent);
			});
		};

		const find = (type: ActivityType, parent?: string): Promise<string> => {
			if (type === ActivityType.Task) {
				return getTasks(parent).then((response: string[]) => {
					const listId = getListId(type, parent);
					activityLists.value[listId] = response;
					return Promise.resolve(listId);
				});
			} else {
				return getActivities(type, parent).then((response: string[]) => {
					const listId = getListId(type, parent);
					activityLists.value[listId] = response;
					return Promise.resolve(listId);
				});
			}
		};

		const add = (activity: Activity, listId: string) => {
			return activityStore.add(activity).then((response: any) => {
				activityLists.value[listId].push(response.id);
				return response.id;
			});
		};

		return {
			list,
			find,
			add,
		};
	}
);
