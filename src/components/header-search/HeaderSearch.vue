<script setup lang="ts">
import { nextTick, ref } from 'vue';
import SearchResults from './SearchResults.vue';

const searchVisible = ref(false);
const searchRef = ref(null);
const searchText = ref('');

const showSearch = async () => {
    searchVisible.value = true;
    await nextTick();
    if (null !== searchRef.value) {
        (searchRef.value as HTMLInputElement).focus();
    }
};
const hideSearch = () => {
    // searchVisible.value = false;
    // searchText.value = '';
};
</script>
<template>
    <v-text-field density="compact"
                  variant="solo"
                  label="Search"
                  append-inner-icon="mdi-magnify"
                  single-line
                  hide-details
                  ref="searchRef"
                  v-model="searchText"
                  v-if="searchVisible"
                  @blur="hideSearch" />
    <v-btn icon="mdi-magnify"
           @click="showSearch"
           v-if="!searchVisible" />
    <SearchResults v-if="searchVisible"
                   :searchText="searchText" />
</template>