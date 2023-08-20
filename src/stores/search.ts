import type Activity from '@/types/activity';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { useActivityStore } from './activities';
import type { SearchState } from '@/types/search';

export const useSearchStore = defineStore(
    'search',
    () => {
        const state: Ref<SearchState> = ref({
            activities: [],
            loading: true,
            searchText: '',
        });

        const activityStore = useActivityStore();

        const isLoading = computed((): boolean => state.value.loading);
        const activities = computed((): Activity[] => state.value.activities);

        const search = (searchText: string, types?: string[]) => {
            state.value.searchText = searchText;
            if (state.value.searchText.length < 3) {
                state.value.activities = [];
                return;
            }
            const searchOptions: PouchDB.Find.FindRequest<{}> = {
                selector: {
                    title: {
                        $regex: new RegExp(searchText, 'gi'),
                    }
                },
            };
            if (types) {
                searchOptions.selector.type = {
                    $in: types,
                };
            }
            return activityStore.find(
                searchOptions, false
            ).then((response) => {
                state.value.activities = response ? response : [];
            });
        };

        const clear = () => {
            state.value.activities = [];
            state.value.searchText = '';
        };

        return {
            state,
            isLoading,
            activities,
            search,
            clear,
        };
    }
);
