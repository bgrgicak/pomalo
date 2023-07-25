<script setup lang="ts">
import { openActivityPage } from '@/helper/activities';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { ref, watch, type Ref } from 'vue';
import ActivityTitle from '@/components/activity/ActivityTitle.vue';
import TimerToggle from '../timer/TimerToggle.vue';

const props = defineProps(['searchText']);
const searchResults: Ref<Activity[]> = ref([]);
const emit = defineEmits(['hideSearch']);

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

const hide = () => {
    emit('hideSearch');
};

const openActivity = (activity: Activity) => {
    openActivityPage(activity);
    hide();
};

</script>
<template>
    <v-card class="search-results"
            v-if="searchResults.length">
        <v-list>
            <v-list-item v-for="activity in searchResults"
                         :key="activity._id"
                         class="search-result">
                <ActivityTitle :activity="activity"
                               @click="() => openActivity(activity)" />
                <v-spacer />
                <TimerToggle :activity="activity"
                             @change="hide" />
            </v-list-item>
        </v-list>
    </v-card>
</template>
<style>
.search-result .v-list-item__content {
    display: flex;
}
</style>
