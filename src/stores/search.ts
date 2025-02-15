import type Activity from '@/types/activity';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { useActivityStore } from './activities';
import type { SearchOptions, SearchState } from '@/types/search';

export const useSearchStore = defineStore(
	'search',
	() => {
		const state: Ref<SearchState> = ref({
			activityIds: [],
			loading: true,
			searchText: '',
		});

		const activityStore = useActivityStore();

		const activities = computed((): Activity[] => {
			return activityStore.list.filter((activity) => {
				return state.value.activityIds.includes(activity._id);
			});
		});

		const search = (searchText: string, options?: SearchOptions | undefined) => {
			state.value.searchText = searchText;
			if (state.value.searchText.length < 3) {
				state.value.activityIds = [];
				return;
			}
			const searchOptions: PouchDB.Find.FindRequest<{}> = {
				selector: {
					title: {
						$regex: new RegExp(searchText, 'gi'),
					},
				},
			};
			if (undefined !== options?.types) {
				searchOptions.selector.type = {
					$in: options?.types,
				};
			}
			if (undefined !== options?.archived) {
				searchOptions.selector.archived = {
					$exists: true,
				};
			}
			return activityStore.find(searchOptions).then((response) => {
				state.value.activityIds = (response ? response : []).map(
					(activity) => activity._id
				);
			});
		};

		const clear = () => {
			state.value.activityIds = [];
			state.value.searchText = '';
		};

		return {
			activities,
			search,
			clear,
		};
	}
);
