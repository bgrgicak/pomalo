import type Activity from "@/types/activity";
import { defineStore } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useActivityStore } from "./activities";
import type { SearchState } from "@/types/search";


export const useSearchStore = defineStore(
    "search",
    () => {
        const state: Ref<SearchState> = ref({
            activities: [],
            loading: true,
            searchText: '',
        });

        const activityStore = useActivityStore();

        const isLoading = computed((): boolean => state.value.loading);
        const activities = computed((): Activity[] => state.value.activities);

        const search = (searchText: string) => {
            state.value.searchText = searchText;
            if (state.value.searchText.length < 3) {
                state.value.activities = [];
                return;
            }
            return activityStore.find({
                selector: {
                    title: {
                        $regex: new RegExp(searchText, 'gi'),
                    },
                },
            }, false).then((response) => {
                state.value.activities = response ?? [];
            });
        };

        return {
            state,
            isLoading,
            activities,
            search,
        };
    }
);
