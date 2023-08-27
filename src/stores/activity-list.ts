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
				list[key] = activityLists.value[key].filter((id: string) => {
					return activityStore.activities[id];
				}).map((id: string) => {
					return activityStore.activities[id];
				});
			});
			return list;
		});

		const activitiesToIds = (activities: Activity[], parent?: string): string[] => {
			return activities.filter((activity: Activity) => {
				if (parent) {
					return activity.parent === parent;
				}
				return true !== activity.archived;
			}).map((activity: Activity) => activity._id);
		};

		const getListId = (type: ActivityType, parent?: string): string => {
			return btoa(`${type}-${parent}`);
		};

		const addActivityList = (type: ActivityType, parent?: string, activities: Activity[] = []): string => {
			const listId = getListId(type, parent);
			activityLists.value[listId] = activitiesToIds(
				activities.map((row: any) => row.doc),
				parent
			);
			return listId;
		};

		const getPriorityTypeView = (type: ActivityType, parent?: string): Promise<string> => {
			return activityStore.query(
				'priority/type',
				{
					endkey: [ActivityType.Task],
					startkey:[ActivityType.Task, {}],
					include_docs: true,
					descending: true
				}
			).then((response: Activity[] | void) => {
				if (!response) {
					return Promise.reject([]);
				}
				return addActivityList(type, parent, response);
			});
		};

		const find = (type: ActivityType, parent?: string): Promise<string> => {	
			return activityStore.find({
				selector: {
					type,
					parent,
				}
			}).then((response: any) => {
				return activitiesToIds(response, parent);
			}).then((response: string[]) => {
				const listId = getListId(type, parent);
				activityLists.value[listId] = response;
				return Promise.resolve(listId);
			});
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
			getPriorityTypeView,
			add,
		};
	}
);
