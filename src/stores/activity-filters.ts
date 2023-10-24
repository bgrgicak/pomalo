import router from '@/router/router';
import type { ActivityFilterGroup, ActivityFilterSort, ActivityFilterState, ActivityFilterStatus } from '@/types/activity-filter';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';


export const useActivityFilterStore = defineStore(
	'activity-filters',
	() => {
		const state: Ref<ActivityFilterState> = ref({});

		const filters = computed(() => state.value);

		const setStateFromRouter = () => {
			state.value.status = router.currentRoute.value.query.status as ActivityFilterStatus | undefined;
			state.value.project = router.currentRoute.value.query.project as string | undefined;
			state.value.group = router.currentRoute.value.query.group as ActivityFilterGroup | undefined;
			state.value.sort = router.currentRoute.value.query.sort as ActivityFilterSort | undefined;
		};
		setStateFromRouter();

		const updateRouterState = () => {
			router.push({
				query: {
					...router.currentRoute.value.query,
					status: state.value.status,
					project: state.value.project,
					group: state.value.group,
					sort: state.value.sort,
				}
			});
		};

		const updateFilter = (filter: string, value: string | boolean | undefined) => {
			if ('status' === filter) {
				state.value.status = value ? value as ActivityFilterStatus : undefined;
			} else if ('project' === filter) {
				state.value.project = value as string;
			} else if ('group' === filter) {
				state.value.group = value as ActivityFilterGroup;
			} else if ('sort' === filter) {
				state.value.sort = value as ActivityFilterSort;
			}

			updateRouterState();
		};

		return {
			filters,
			updateFilter
		};
	}
);
