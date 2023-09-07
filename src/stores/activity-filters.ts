import router from '@/router/router';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';

interface ActivityFilterState {
    completed?: boolean;
    project?: string;
    group?: string;
    sort?: string;
}

export const useActivityFilterStore = defineStore(
	'activity-filters',
	() => {
		const state: Ref<ActivityFilterState> = ref({});

		const filters = computed(() => state.value);

		const setStateFromRouter = () => {
			state.value.completed = router.currentRoute.value.query.completed === 'true';
			state.value.project = router.currentRoute.value.query.project as string | undefined;
			state.value.group = router.currentRoute.value.query.group as string | undefined;
			state.value.sort = router.currentRoute.value.query.sort as string | undefined;
		};
		setStateFromRouter();

		const updateRouterState = () => {
			router.push({
				query: {
					...router.currentRoute.value.query,
					completed: state.value.completed ? 'true' : undefined,
					project: state.value.project,
					group: state.value.group,
					sort: state.value.sort,
				}
			});
		};

		const updateFilter = (filter: string, value: string | boolean | undefined) => {
			if ('completed' === filter) {
				state.value.completed = value as boolean;
			} else if ('project' === filter) {
				state.value.project = value as string;
			} else if ('group' === filter) {
				state.value.group = value as string;
			} else if ('sort' === filter) {
				state.value.sort = value as string;
			}

			updateRouterState();
		};

		return {
			filters,
			updateFilter
		};
	}
);
