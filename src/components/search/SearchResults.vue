<script setup lang="ts">
import { getTasks } from '@/database/activities';
import type Activity from '@/types/activity';
import { ref, watch, type Ref } from 'vue';

const props = defineProps(['searchText']);
const searchResults: Ref<Activity[]> = ref([]);

watch(() => props.searchText, async (searchText: string) => {
    if (searchText.length < 3) {
        searchResults.value = [];
        return;
    }
    getTasks().then((response) => {
        searchResults.value = response.docs as Activity[];
    });
});

</script>
<template>
    <v-card class="search-results" v-if="searchResults.length">
        <v-list>
            <v-list-item v-for="result in searchResults"
                        :key="result._id">
                <v-list-item-title>{{ result.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
</template>