<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import { nextTick, ref } from 'vue';
import SearchResults from './SearchResults.vue';
import constants from '@/helper/constants';

const searchVisible = ref(false);
const searchRef = ref(null);
const searchText = ref('');

const layoutStore = useLayoutStore();

const showSearch = async () => {
    searchVisible.value = true;
    await nextTick();
    if (null !== searchRef.value) {
        (searchRef.value as HTMLInputElement).focus();
    }
};
const hideSearch = () => {
    searchVisible.value = false;
    searchText.value = '';
};
const showLeftSidebar = () => {
    layoutStore.showLeftSidebar();
};
</script>
<template>
    <div class="header-search"
         v-click-outside="hideSearch">
        <v-text-field density="compact"
                      variant="solo"
                      label="Search"
                      append-inner-icon="mdi-magnify"
                      single-line
                      hide-details
                      ref="searchRef"
                      v-model="searchText"
                      v-if="searchVisible"
                      @click:append-inner="showLeftSidebar"
                      class="header-search__input" />
        <v-btn icon="mdi-magnify"
               @click="showSearch"
               v-if="!searchVisible" />
        <SearchResults class="header-search__results"
                       v-if="searchVisible"
                       :searchText="searchText"
                       @hideSearch="hideSearch" />
    </div>
</template>
<style lang="scss">
@import '@/styles/variables.scss';
$form-width: 300px;

.header-search__input {
    width: $form-width;
    position: relative;
}

.header-search__results {
    z-index: $search-results-z-index;
    position: fixed;
    width: $form-width;
    max-width: 100%;
    top: calc(#{$header-height} - 6px);

    .v-list-item--link {
        cursor: unset;
    }
}
</style>