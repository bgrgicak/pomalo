<script setup lang="ts">
import ActivityListFilters from '@/components/activity/ActivityListFilters.vue';
import { useLayoutStore } from '@/stores/layout';

const layoutStore = useLayoutStore();
const hide = () => {
	layoutStore.hideLeftSidebar();
};

const clickOutsideConditional = (event: any) => {
	if (event.target) {
		return ! event.target.classList.contains('v-list-item')
      && ! event.target.classList.contains('v-list-item-title');
	}
	return false;
};
</script>
<template>
  <v-navigation-drawer
    v-if="layoutStore.isLeftSidebarVisible"
    width="244"
    location="left"
    :model-value="layoutStore.isLeftSidebarVisible"
    class="left-sidebar"
    @update:model-value="hide"
  >
    <div
      v-click-outside.self="{
        handler: hide,
        closeConditional: clickOutsideConditional
      }"
    >
      <ActivityListFilters />
    </div> 
  </v-navigation-drawer>
</template>
<style scoped lang="scss">
@import '@/styles/variables.scss';
</style>