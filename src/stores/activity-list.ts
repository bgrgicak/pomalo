import { defineStore } from 'pinia';
import type Activity from '@/types/activity';
import { computed, ref, type Ref } from 'vue';
import { useActivityStore } from './activities';
import { ActivityType } from '@/types/activity';

export const useActivityListStore = defineStore(
	'activity-list',
	() => {
		const activityIds: Ref<string[]> = ref([]);

		const activityStore = useActivityStore();

		const list = computed((): Activity[] => {
			return activityStore.list.filter((activity) => {
				return activityIds.value.includes(activity._id as string)
					&& !activity.removed;
			});
		});

		const activitiesToIds = (activities: Activity[], parent?: string): string[] => {
			return activities.filter((activity: Activity) => {
				if (parent) {
					return activity.parent === parent;
				}
				return true !== activity.removed;
			}).map((activity: Activity) => activity._id);
		};

		const getTasks = (parent?: string): Promise<string[] | void> => {
			return activityStore.query(
				'priority/type',
				{
					endkey: ['task'],
					startkey: ['task', {}],
					include_docs: true,
					descending: true
				}
			).then((response: any) => {
				activityIds.value = activitiesToIds(response, parent);
				return activityIds.value;
			});
		};

		const getActivities = (type: ActivityType, parent?: string): Promise<string[] | void> => {
			return activityStore.find({
				selector: {
					type: type
				}
			}).then((response: any) => {
				activityIds.value = activitiesToIds(response, parent);
				return activityIds.value;
			});
		};

		const find = (type: ActivityType, parent?: string): Promise<string[] | void> => {
			if (type === ActivityType.Task) {
				return getTasks(parent);
			} else {
				return getActivities(type, parent);
			}
		};

		const add = (activity: Activity) => {
			return activityStore.add(activity).then((response: any) => {
				activityIds.value.push(response.id);
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
