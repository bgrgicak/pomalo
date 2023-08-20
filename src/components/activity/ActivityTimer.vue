<script setup lang="ts">
import __ from '@/helper/translations';
import { useTimerStore } from '@/stores/timer';
import type Activity from '@/types/activity';
import { computed } from 'vue';

import type { PropType } from 'vue';

const props = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    required: true,
  }
});

const timerStore = useTimerStore();

const isActive = computed(() => {
    return timerStore.active && timerStore.activityId === props.activity._id;
});
</script>
<template v-if="!timerStore.isLoading">
  <v-btn
    v-if="isActive"
    class="activity-stop"
    append-icon="mdi-stop-circle-outline"
    @click="timerStore.stop"
  >
    {{ __('Stop timer') }}
  </v-btn>
  <v-btn
    v-else
    color="primary"
    class="activity-start"
    append-icon="mdi-play-circle-outline"
    @click="() => timerStore.start(props.activity._id)"
  >
    {{ __('Start timer') }}
  </v-btn>
</template>
<style scoped lang="scss">
.activity-start,
.activity-stop {
    width: 100%;
}
</style>