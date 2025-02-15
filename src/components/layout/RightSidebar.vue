<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityMain from '@/components/activity/ActivityMain.vue';
import { computed } from 'vue';
import { useActivityStore } from '@/stores/activities';
import { watch } from 'vue';
import { getActivityLink } from '@/data/activities';
import router from '@/router/router';
import { ref } from 'vue';

const layoutStore = useLayoutStore();
const activityStore = useActivityStore();

const firstLoad = ref(true);

const activityId = computed(() => layoutStore.currentActivityId as string);
const activity = computed(() => activityStore.activities[activityId.value]);
const event = computed(() => layoutStore.currentEvent ?? undefined);
const width = computed(
	() => {
		const windowWidth = window.innerWidth / 2;
		if ( windowWidth < 350 ) {
			return 350;
		} else if ( windowWidth > 1000 ) {
			return 1000;
		}
		return windowWidth;
	});

if (activityId.value) {
	activityStore.get(activityId.value);
}

const hide = () => {
	layoutStore.hideRightSidebar();
};

watch(
	() => router.currentRoute.value.path,
	() => {
		if (!firstLoad.value) {
			hide();
		}
		firstLoad.value = false;
	}
);

</script>
<template>
  <v-navigation-drawer
    v-if="layoutStore.isRightSidebarVisible"
    location="right"
    :width="width"
    :model-value="layoutStore.isRightSidebarVisible"
    class="right-sidebar"
    :temporary="true"
    @update:model-value="hide"
  >
    <header class="right-sidebar__header py-3">
      <v-btn
        v-if="activity"
        icon="mdi-arrow-expand"
        variant="plain"
        size="56"
        class="right-sidebar__expand ml-2"
        :href="getActivityLink(activity)"
      />
      <v-spacer />
      <v-btn
        icon="mdi-close"
        variant="plain"
        size="56"
        class="right-sidebar__close mr-2"
        @click="hide"
      />
    </header>
    <ActivityMain
      :activity="activity"
      :event="event"
      :small="true"
    />
  </v-navigation-drawer>
</template>
<style lang="scss">
@import '@/styles/variables.scss';

.right-sidebar {
  top: $header-height !important;
  height: calc(100vh - #{$header-height}) !important;
  overflow-y: auto;
  min-width: 350px;

  .v-navigation-drawer__content {
    >.v-card {
      padding-top: 0 !important;
      height: 100%;

      .v-container {
        padding-top: 0 !important;
      }
    }
  }
}

.right-sidebar__header {
  display: flex;
  height: $sidebar-header-height;
}
</style>