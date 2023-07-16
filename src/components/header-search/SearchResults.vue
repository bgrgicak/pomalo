<script setup lang="ts">
import { getAll } from '@/database/activities';
import type Activity from '@/types/activity';
import { ref, watch, type Ref } from 'vue';

const props = defineProps(['searchText']);
const searchResults: Ref<Activity[]> = ref([]);
console.log(searchResults);

watch(() => props.searchText, async (searchText: string) => {
    if (searchText.length < 3) {
        searchResults.value = [];
        return;
    }
    getAll().then((response) => {
        searchResults.value = response.rows.map(row => row.doc as Activity);
    });
});

</script>
<template>
    <v-list>
        <v-list-item v-for="result in searchResults"
                     :key="result._id">
            <v-list-item-title>{{ result.name }}</v-list-item-title>
        </v-list-item>
    </v-list>
</template>