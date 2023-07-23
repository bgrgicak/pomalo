<script setup lang="ts">
import { openActivityPage } from '@/helper/activities';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { ref, watch, type Ref } from 'vue';
import ActivityTitle from '@/components/activity/ActivityTitle.vue';

const props = defineProps(['searchText']);
const searchResults: Ref<Activity[]> = ref([]);

const activityStore = useActivityStore();

watch(() => props.searchText, async (searchText: string) => {
    if (searchText.length < 3) {
        searchResults.value = [];
        return;
    }
    activityStore.find({
        selector: {
            title: {
                $regex: new RegExp(searchText, 'gi'),
            },
        },
    }).then((response) => {
        searchResults.value = response ?? [];
    });
});

const openActivity = (activity: Activity, emit: Function) => {
    openActivityPage(activity);
    emit('hideSearch');
};

</script>
<template>
    <v-card class="search-results"
            v-if="searchResults.length">
        <v-list>
            <v-list-item v-for="activity in searchResults"
                         :key="activity._id"
                         @click="() => openActivity(activity, $emit)">
                <v-list-item-title>
                    <ActivityTitle :activity="activity" />
                </v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
</template>
