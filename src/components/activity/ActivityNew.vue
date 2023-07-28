<script setup lang="ts">
import __ from '@/helper/translations';
import { ref } from 'vue';
import SearchResults from '../search/SearchResults.vue';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';

const title = ref('');

const layoutStore = useLayoutStore();

const activityClick = (activity: Activity) => {
    console.log(activity);
    layoutStore.showRightSidebar(activity._id);
};

</script>
<template>
    <v-row>
        <v-col cols="12">
            <v-text-field v-model="title"
                          class="activity-title"
                          autofocus
                          variant="underlined" />
            <SearchResults :searchText="title"
                           openInSidebar="true"
                           @click="activityClick" />
        </v-col>
    </v-row>
</template>