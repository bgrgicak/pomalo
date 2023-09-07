<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityListFilters from '@/components/activity/ActivityListFilters.vue';

const layoutStore = useLayoutStore();
const hide = () => {
	layoutStore.hideLeftSidebar();
};

const clickOutsideConditional = (event: any) => {
	if (event.target) {
		return ! event.target.classList.contains('v-list-item')
      && ! event.target.classList.contains('v-list-item-title');
	}
	return true;
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

.left-sidebar {
    top: $header-height !important;
}
</style>