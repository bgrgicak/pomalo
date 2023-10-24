import router from '@/router/router';
import type { ActivityFilterGroup, ActivityFilterSort, ActivityFilterState, ActivityFilterStatus } from '@/types/activity-filter';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { useSettingsStore } from './settings';

const DEFAULT_ACTIVITY_FILTER_SETTINGS_KEY = 'default-activity-filters';

export const useActivityFilterStore = defineStore(
	'activity-filters',
	() => {
		const state: Ref<ActivityFilterState> = ref({});

		const settingsStore = useSettingsStore();

		const filters = computed(() => state.value);

		const loadDefaultState = () => {
			const defaultFilters = settingsStore.get( DEFAULT_ACTIVITY_FILTER_SETTINGS_KEY );
			if ( defaultFilters ) {
				state.value = defaultFilters;
			}
		};
		const setStateFromRouter = () => {
			if (Object.keys(router.currentRoute.value.query).length > 0) {
				state.value.status = router.currentRoute.value.query.status as ActivityFilterStatus | undefined;
				state.value.project = router.currentRoute.value.query.project as string | undefined;
				state.value.group = router.currentRoute.value.query.group as ActivityFilterGroup | undefined;
				state.value.sort = router.currentRoute.value.query.sort as ActivityFilterSort | undefined;
			} else {
				loadDefaultState();
			}
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

		const setDefaults = () => {
			settingsStore.update(DEFAULT_ACTIVITY_FILTER_SETTINGS_KEY, state.value);
			settingsStore.save();
		};

		return {
			filters,
			updateFilter,
			setDefaults,
		};
	}
);
