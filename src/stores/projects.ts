import { defineStore } from 'pinia';
import { type Ref, computed, ref } from 'vue';
import { useActivityStore } from './activities';
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';

interface ProjectState {
    projectIds: string[]
}

export const useProjectStore = defineStore(
	'projects',
	() => {
		const state: Ref<ProjectState> = ref({
			projectIds: [],
		});

		const activityStore = useActivityStore();

		const getAll = (): Promise<any> => {
			return activityStore.find({
				selector: {
					type: ActivityType.Project,
				}
			}).then((response: Activity[] | void) => {
				if (!response) {
					return Promise.resolve([]);
				}
				state.value.projectIds = response.map((row: any) => row._id);
				return Promise.resolve(state.value.projectIds);
			});
		};
		getAll();

		const projects = computed(() => {
			return state.value.projectIds.map((projectId) => {
				return activityStore.activities[projectId];
			});
		});

		const getTitle = (projectId: string): any => {
			if (!activityStore.activities[projectId]) {
				return '';
			}
			return activityStore.activities[projectId].title;
		};
		

		return {
			projects,
			getTitle
		};
	}
);
