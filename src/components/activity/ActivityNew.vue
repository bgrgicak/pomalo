<script setup lang="ts">
import __ from '@/helper/translations';
import { ref } from 'vue';
import SearchResults from '../search/SearchResults.vue';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import { openActivityPage } from '@/data/activities';
import { useActivityStore } from '@/stores/activities';
import { addEventToActivity } from '@/data/events';

const props = defineProps(['event', 'openInSidebar']);
const title = ref('');

const layoutStore = useLayoutStore();
const activityStore = useActivityStore();

const activityClick = (activity: Activity) => {
    if (props.event) {
        activityStore.update(
            addEventToActivity(
                activity,
                props.event
            )
        );
    }
    if (props.openInSidebar) {
        layoutStore.showRightSidebar(activity._id);
    } else {
        openActivityPage(activity);
    }
};

</script>
<template>
    <v-row>
        <v-col cols="12">
            <v-text-field v-model="title"
                          class="activity-title"
                          autofocus />
            <SearchResults :searchText="title"
                           openInSidebar="true"
                           @click="activityClick" />
        </v-col>
    </v-row>
</template>